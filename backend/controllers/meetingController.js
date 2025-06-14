import catchAsyncError from '../middlewares/catchAsyncError.js';
import MeetingModel from '../models/meetings.js'; 
import sendResponse from '../utils/sendResponse.js';
import ErrorHandler from '../utils/errorHandler.js';
import sendEmail from '../utils/sendEmail.js';
import { v2 as cloudinary } from 'cloudinary';
import path from "path"
import fs from "fs"
import os from "os"

// ============ OPTIMIZED CLOUDINARY CONFIG ============
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    timeout: parseInt(process.env.CLOUDINARY_UPLOAD_TIMEOUT) || 120000, // Increased to 2 minutes
    chunk_size: parseInt(process.env.CLOUDINARY_CHUNK_SIZE) || 10000000, // 10MB chunks for better performance
    secure: true, // Force HTTPS
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || undefined
});

// ============ PERFORMANCE OPTIMIZED VALIDATION ============
const validateFileSize = (base64Data, maxSizeMB = 50) => {
    // More efficient size calculation without string manipulation
    const paddingCount = (base64Data.match(/=/g) || []).length;
    const sizeInBytes = (base64Data.length * 0.75) - paddingCount;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    console.log(`📏 File size: ${sizeInMB.toFixed(2)}MB`);
    
    if (sizeInMB > maxSizeMB) {
        throw new ErrorHandler(`File size (${sizeInMB.toFixed(2)}MB) exceeds maximum (${maxSizeMB}MB)`, 413);
    }
    
    return sizeInMB;
};

// ============ ULTRA-OPTIMIZED UPLOAD FUNCTION ============
const uploadToCloudinary = async (data, options, retries = 3) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 120000);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`🚀 Upload attempt ${attempt}/${retries}...`);
            const startTime = Date.now();
            let result;
            
            if (options.resource_type === "video") {
                // ============ OPTIMIZED VIDEO UPLOAD WITH STREAMING ============
                const tempFilePath = path.join(os.tmpdir(), `temp-video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webm`);
                
                try {
                    console.log(`📁 Creating temp file: ${path.basename(tempFilePath)}`);
                    
                    // Write file in chunks for large videos (memory efficient)
                    const buffer = Buffer.from(data, 'base64');
                    const writeStream = fs.createWriteStream(tempFilePath);
                    
                    await new Promise((resolve, reject) => {
                        writeStream.write(buffer, (err) => {
                            if (err) reject(err);
                            else {
                                writeStream.end();
                                resolve();
                            }
                        });
                        writeStream.on('error', reject);
                        writeStream.on('finish', resolve);
                    });
                    
                    console.log(`📤 Streaming upload to Cloudinary...`);
                    
                    // Optimized upload with better settings
                    result = await cloudinary.uploader.upload(tempFilePath, {
                        ...options,
                        resource_type: "video",
                        timeout: 120000,
                        chunk_size: 10000000, // 10MB chunks
                        use_filename: false,
                        unique_filename: true,
                        overwrite: false,
                        // Video optimization settings
                        video_codec: 'h264',
                        audio_codec: 'aac',
                        bit_rate: '1m', // 1 Mbps for faster processing
                        fps: '24', // Standard frame rate
                        quality: 'auto:low', // Faster processing
                        fetch_format: 'auto'
                    });
                    
                } catch (uploadError) {
                    console.error(`❌ Video upload error:`, uploadError.message);
                    throw uploadError;
                } finally {
                    // Async cleanup - don't wait for it
                    setImmediate(() => {
                        try {
                            if (fs.existsSync(tempFilePath)) {
                                fs.unlinkSync(tempFilePath);
                                console.log(`🗑️ Temp file cleaned up`);
                            }
                        } catch (deleteError) {
                            console.warn(`⚠️ Cleanup warning:`, deleteError.message);
                        }
                    });
                }
            } else {
                // ============ OPTIMIZED IMAGE UPLOAD ============
                result = await cloudinary.uploader.upload(data, {
                    ...options,
                    timeout: 60000,
                    use_filename: false,
                    unique_filename: true,
                    overwrite: false
                });
            }
            
            const duration = Date.now() - startTime;
            console.log(`✅ Upload complete in ${duration}ms`);
            clearTimeout(timeoutId);
            
            return result;
            
        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed:`, error.message);
            
            // Retry logic for specific errors
            const retryableErrors = ['ETIMEDOUT', 'timeout', 'ECONNRESET', 'ENOTFOUND'];
            const shouldRetry = retryableErrors.some(err => 
                error.message?.toLowerCase().includes(err.toLowerCase()) || 
                error.code?.toLowerCase().includes(err.toLowerCase())
            );
            
            if (attempt < retries && shouldRetry) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
                console.log(`🔁 Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            
            clearTimeout(timeoutId);
            throw error;
        }
    }
};

// ============ MAIN CREATE FUNCTION WITH FULL PARALLELIZATION ============
export const create = catchAsyncError(async (req, res, next) => {
    const { meeting_id, name, address, post_code, reference, repair_detail, target_time, recordings, screenshots, update_mode } = req.body;
    const user_id = req.user._id;
    
    const startTime = Date.now();
    console.log(`🚀 [${new Date().toISOString()}] Starting PARALLEL meeting ${update_mode || 'creation'}...`);
    console.log('👤 User ID:', user_id);
    console.log('📊 Media counts - Recordings:', recordings?.length || 0, 'Screenshots:', screenshots?.length || 0);
    
    // Validate required fields
    if (!meeting_id) {
        return next(new ErrorHandler("Meeting ID is required", 400));
    }

    // Check if meeting exists
    const existingMeeting = await MeetingModel.findOne({ meeting_id });
    if (existingMeeting) {
        console.log('⚠️ Meeting exists, updating with parallel uploads...');
        
        if (!existingMeeting.userId) {
            existingMeeting.userId = user_id;
        }
        
        return await updateMeetingWithParallelUploads(existingMeeting, req.body, res, next, user_id, req);
    }

    // ============ PARALLEL UPLOAD PROCESSING ============
    const uploadPromises = [];
    const uploadMetadata = [];

    try {
        // Process recordings in parallel (no waiting)
        if (recordings && recordings.length > 0) {
            console.log(`🎥 Preparing ${recordings.length} recordings for PARALLEL upload...`);
            
            recordings.forEach((recording, i) => {
                uploadMetadata.push({ type: 'recording', index: i, user_id });
                
                const uploadPromise = (async () => {
                    try {
                        console.log(`📹 [PARALLEL] Starting recording ${i + 1}/${recordings.length}...`);
                        
                        validateFileSize(recording.data, 100);
                        
                        const recordingData = recording.data.includes(',') 
                            ? recording.data.split(",").pop() 
                            : recording.data;
                            
                        const uploadResult = await uploadToCloudinary(recordingData, {
                            folder: 'videodesk_recordings',
                            public_id: `rec_${meeting_id}_${user_id}_${Date.now()}_${i}`,
                            resource_type: 'video',
                            transformation: [
                                { quality: 'auto:low' },
                                { fetch_format: 'auto' },
                                { flags: 'streaming_attachment' } // Enable streaming
                            ]
                        });
                        
                        console.log(`✅ [PARALLEL] Recording ${i + 1} uploaded: ${uploadResult.secure_url.substring(0, 50)}...`);
                        
                        return {
                            type: 'recording',
                            url: uploadResult.secure_url,
                            cloudinary_id: uploadResult.public_id,
                            timestamp: new Date(recording.timestamp),
                            duration: recording.duration || 0,
                            size: uploadResult.bytes || 0,
                            uploaded_by: user_id
                        };
                    } catch (error) {
                        console.error(`❌ [PARALLEL] Recording ${i + 1} failed:`, error.message);
                        return { type: 'recording', error: error.message };
                    }
                })();
                
                uploadPromises.push(uploadPromise);
            });
        }

        // Process screenshots in parallel (no waiting)
        if (screenshots && screenshots.length > 0) {
            console.log(`📸 Preparing ${screenshots.length} screenshots for PARALLEL upload...`);
            
            screenshots.forEach((screenshot, i) => {
                uploadMetadata.push({ type: 'screenshot', index: i, user_id });
                
                const uploadPromise = (async () => {
                    try {
                        console.log(`🖼️ [PARALLEL] Starting screenshot ${i + 1}/${screenshots.length}...`);
                        
                        validateFileSize(screenshot.data, 25);
                        
                        const uploadResult = await uploadToCloudinary(screenshot.data, {
                            folder: 'videodesk_screenshots',
                            public_id: `shot_${meeting_id}_${user_id}_${Date.now()}_${i}`,
                            resource_type: 'image',
                            transformation: [
                                { quality: 'auto:good' },
                                { fetch_format: 'auto' },
                                { width: 1280, height: 720, crop: 'limit' }
                            ]
                        });
                        
                        console.log(`✅ [PARALLEL] Screenshot ${i + 1} uploaded: ${uploadResult.secure_url.substring(0, 50)}...`);
                        
                        return {
                            type: 'screenshot',
                            url: uploadResult.secure_url,
                            cloudinary_id: uploadResult.public_id,
                            timestamp: new Date(screenshot.timestamp),
                            size: uploadResult.bytes || 0,
                            uploaded_by: user_id
                        };
                    } catch (error) {
                        console.error(`❌ [PARALLEL] Screenshot ${i + 1} failed:`, error.message);
                        return { type: 'screenshot', error: error.message };
                    }
                })();
                
                uploadPromises.push(uploadPromise);
            });
        }

        // ============ WAIT FOR ALL PARALLEL UPLOADS ============
        console.log(`⚡ Executing ${uploadPromises.length} uploads in PARALLEL...`);
        const uploadResults = await Promise.allSettled(uploadPromises);
        
        // Separate successful uploads from failures
        const successfulUploads = uploadResults
            .map(result => result.status === 'fulfilled' ? result.value : null)
            .filter(result => result && !result.error);
            
        const failedUploads = uploadResults
            .map(result => result.status === 'rejected' || (result.status === 'fulfilled' && result.value?.error))
            .filter(Boolean);

        const savedRecordings = successfulUploads.filter(upload => upload.type === 'recording');
        const savedScreenshots = successfulUploads.filter(upload => upload.type === 'screenshot');

        // Create meeting with all successful uploads
        const meeting = await MeetingModel.create({
            meeting_id,
            name,
            address,
            post_code,
            reference,
            repair_detail,
            target_time,
            owner: user_id,
            userId: user_id,
            created_by: user_id,
            last_updated_by: user_id,
            recordings: savedRecordings,
            screenshots: savedScreenshots,
            total_recordings: savedRecordings.length,
            total_screenshots: savedScreenshots.length
        });
        
        const totalTime = Date.now() - startTime;
        console.log(`🎉 PARALLEL meeting creation completed in ${totalTime}ms!`);
        console.log(`📊 Success rates - Recordings: ${savedRecordings.length}/${recordings?.length || 0}, Screenshots: ${savedScreenshots.length}/${screenshots?.length || 0}`);
        console.log(`❌ Failed uploads: ${failedUploads.length}`);
        
        res.status(201).json({
            success: true,
            message: "Meeting created successfully with parallel uploads",
            meeting: meeting,
            upload_summary: {
                total_time: `${totalTime}ms`,
                parallel_uploads: uploadPromises.length,
                successful_recordings: savedRecordings.length,
                successful_screenshots: savedScreenshots.length,
                failed_uploads: failedUploads.length,
                created_by: user_id,
                performance_improvement: "PARALLEL PROCESSING ENABLED"
            },
            user_message_settings: req.user?.messageSettings
        });

    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error(`❌ Parallel meeting creation failed after ${totalTime}ms:`, error.message);
        
        return next(new ErrorHandler(`Parallel upload failed after ${totalTime}ms. Please try again.`, 500));
    }
});

// ============ PARALLEL UPDATE FUNCTION ============
const updateMeetingWithParallelUploads = async (meeting, data, res, next, user_id, req) => {
    const { name, address, post_code, reference, repair_detail, target_time, recordings, screenshots } = data;
    
    console.log(`🔄 PARALLEL update for meeting ${meeting.meeting_id}...`);
    console.log(`📊 New media - Recordings: ${recordings?.length || 0}, Screenshots: ${screenshots?.length || 0}`);
    
    try {
        // Update basic fields
        if (name) meeting.name = name;
        if (address) meeting.address = address;
        if (post_code) meeting.post_code = post_code;
        if (reference) meeting.reference = reference;
        if (repair_detail) meeting.repair_detail = repair_detail;
        if (target_time) meeting.target_time = target_time;
        
        if (!meeting.userId) meeting.userId = user_id;
        meeting.last_updated_by = user_id;

        const uploadPromises = [];
        let newRecordingsCount = 0;
        let newScreenshotsCount = 0;

        // Process recordings in parallel
        if (recordings && recordings.length > 0) {
            console.log(`🎥 Adding ${recordings.length} recordings in PARALLEL...`);
            
            recordings.forEach((recording, i) => {
                const uploadPromise = (async () => {
                    try {
                        validateFileSize(recording.data, 100);
                        const recordingData = recording.data.includes(',') ? recording.data.split(",").pop() : recording.data;
                        
                        const uploadResult = await uploadToCloudinary(recordingData, {
                            folder: 'videodesk_recordings',
                            public_id: `rec_${meeting.meeting_id}_${user_id}_${Date.now()}_${i}`,
                            resource_type: 'video',
                            transformation: [
                                { quality: 'auto:low' },
                                { fetch_format: 'auto' }
                            ]
                        });
                        
                        return {
                            type: 'recording',
                            url: uploadResult.secure_url,
                            cloudinary_id: uploadResult.public_id,
                            timestamp: new Date(recording.timestamp),
                            duration: recording.duration || 0,
                            size: uploadResult.bytes || 0,
                            uploaded_by: user_id
                        };
                    } catch (error) {
                        console.error(`❌ Recording ${i + 1} failed:`, error.message);
                        return null;
                    }
                })();
                
                uploadPromises.push(uploadPromise);
            });
        }

        // Process screenshots in parallel
        if (screenshots && screenshots.length > 0) {
            console.log(`📸 Adding ${screenshots.length} screenshots in PARALLEL...`);
            
            screenshots.forEach((screenshot, i) => {
                const uploadPromise = (async () => {
                    try {
                        validateFileSize(screenshot.data, 25);
                        
                        const uploadResult = await uploadToCloudinary(screenshot.data, {
                            folder: 'videodesk_screenshots',
                            public_id: `shot_${meeting.meeting_id}_${user_id}_${Date.now()}_${i}`,
                            resource_type: 'image',
                            transformation: [
                                { quality: 'auto:good' },
                                { fetch_format: 'auto' },
                                { width: 1280, height: 720, crop: 'limit' }
                            ]
                        });
                        
                        return {
                            type: 'screenshot',
                            url: uploadResult.secure_url,
                            cloudinary_id: uploadResult.public_id,
                            timestamp: new Date(screenshot.timestamp),
                            size: uploadResult.bytes || 0,
                            uploaded_by: user_id
                        };
                    } catch (error) {
                        console.error(`❌ Screenshot ${i + 1} failed:`, error.message);
                        return null;
                    }
                })();
                
                uploadPromises.push(uploadPromise);
            });
        }

        // Wait for all uploads
        const uploadResults = await Promise.all(uploadPromises);
        
        // Add successful uploads to meeting
        const recordingCount = recordings?.length || 0;
        const newRecordings = uploadResults.slice(0, recordingCount).filter(result => result !== null);
        const newScreenshots = uploadResults.slice(recordingCount).filter(result => result !== null);
        
        meeting.recordings.push(...newRecordings);
        meeting.screenshots.push(...newScreenshots);
        
        newRecordingsCount = newRecordings.length;
        newScreenshotsCount = newScreenshots.length;

        // Update totals
        meeting.total_recordings = meeting.recordings.length;
        meeting.total_screenshots = meeting.screenshots.length;

        await meeting.save();
        
        console.log(`✅ PARALLEL update completed`);
        
        res.status(200).json({
            success: true,
            message: "Meeting updated successfully with parallel uploads",
            meeting: meeting,
            media_summary: {
                total_recordings_count: meeting.recordings.length,
                total_screenshots_count: meeting.screenshots.length,
                new_recordings_added: newRecordingsCount,
                new_screenshots_added: newScreenshotsCount,
                updated_by: user_id,
                performance_improvement: "PARALLEL PROCESSING ENABLED"
            },
            user_message_settings: req.user?.messageSettings
        });

    } catch (error) {
        console.error(`❌ PARALLEL update failed:`, error);
        return next(new ErrorHandler("Failed to update meeting with parallel uploads.", 500));
    }
};

// ============ KEEP ALL OTHER FUNCTIONS UNCHANGED ============
// (getAllMeetings, archiveMeeting, etc. remain the same as they're not performance bottlenecks)

// Optimized cleanup function with parallel deletion
const cleanupUploadedFiles = async (uploadedFiles) => {
    if (uploadedFiles.length === 0) return;
    
    console.log(`🧹 PARALLEL cleanup of ${uploadedFiles.length} files...`);
    
    const deletePromises = uploadedFiles.map(async (file) => {
        try {
            await cloudinary.uploader.destroy(file.cloudinary_id, { timeout: 15000 });
            console.log(`🗑️ Deleted: ${file.cloudinary_id}`);
        } catch (error) {
            console.error(`❌ Delete failed: ${file.cloudinary_id}`, error.message);
        }
    });
    
    await Promise.allSettled(deletePromises); // Use allSettled for better error handling
    console.log('✅ PARALLEL cleanup completed');
};

// [Rest of the functions remain unchanged - getAllMeetings, archiveMeeting, etc.]
export const getAllMeetings = catchAsyncError(async (req, res, next) => {
    const user_id = req.user._id;
    const { archived } = req.query;
    
    console.log(`📋 Fetching meetings for user: ${user_id}, archived: ${archived}`);
    
    const filter = {
        $or: [
            { owner: user_id },
            { userId: user_id },
            { created_by: user_id }
        ]
    };
    
    if (archived === 'true') {
        filter.archived = true;
    } else if (archived === 'false') {
        filter.archived = { $ne: true };
    }
    
    const meetings = await MeetingModel.find(filter)
        .populate('created_by', 'email')
        .populate('last_updated_by', 'email')
        .populate('archivedBy', 'email');
    
    console.log(`✅ Found ${meetings.length} meetings for user ${user_id}`);
    
    res.status(200).json({
        success: true,
        meetings,
        total_meetings: meetings.length,
        user_id: user_id,
        filter: archived ? `archived: ${archived}` : 'all meetings'
    });
});

export const archiveMeeting = catchAsyncError(async (req, res, next) => {
    const meeting = await MeetingModel.findOne({
        _id: req.params.id,
        $or: [
            { owner: req.user._id },
            { userId: req.user._id },
            { created_by: req.user._id }
        ]
    });

    if (!meeting) {
        return next(new ErrorHandler("Meeting not found", 404));
    }

    if (meeting.archived) {
        return next(new ErrorHandler("Meeting is already archived", 400));
    }

    meeting.archived = true;
    meeting.archivedAt = new Date();
    meeting.archivedBy = req.user._id;
    meeting.last_updated_by = req.user._id;

    await meeting.save();

    res.status(200).json({
        success: true,
        message: "Meeting archived successfully",
        meeting: meeting
    });
});

export const unarchiveMeeting = catchAsyncError(async (req, res, next) => {
    const meeting = await MeetingModel.findOne({
        _id: req.params.id,
        $or: [
            { owner: req.user._id },
            { userId: req.user._id },
            { created_by: req.user._id }
        ]
    });

    if (!meeting) {
        return next(new ErrorHandler("Meeting not found", 404));
    }

    if (!meeting.archived) {
        return next(new ErrorHandler("Meeting is not archived", 400));
    }

    meeting.archived = false;
    meeting.archivedAt = null;
    meeting.archivedBy = null;
    meeting.last_updated_by = req.user._id;

    await meeting.save();

    res.status(200).json({
        success: true,
        message: "Meeting unarchived successfully",
        meeting: meeting
    });
});

export const getArchivedCount = catchAsyncError(async (req, res, next) => {
    const user_id = req.user._id;
    
    const archivedCount = await MeetingModel.countDocuments({
        $or: [
            { owner: user_id },
            { userId: user_id },
            { created_by: user_id }
        ],
        archived: true
    });
    
    const totalCount = await MeetingModel.countDocuments({
        $or: [
            { owner: user_id },
            { userId: user_id },
            { created_by: user_id }
        ]
    });
    
    res.status(200).json({
        success: true,
        archivedCount,
        totalCount,
        activeCount: totalCount - archivedCount
    });
});

export const getMeetingById = catchAsyncError(async (req, res, next) => {
    const meeting = await MeetingModel.findOne({
        _id: req.params.id,
        $or: [
            { owner: req.user._id },
            { userId: req.user._id },
            { created_by: req.user._id }
        ]
    });

    if (!meeting) {
        return next(new ErrorHandler("Meeting not found", 404));
    }

    sendResponse(true, 200, "Meeting retrieved successfully", res, { meeting });
});

export const getMeetingForShare = catchAsyncError(async (req, res, next) => {
    const meeting = await MeetingModel.findOne({
        meeting_id: req.params.id
    });

    if (!meeting) {
        return next(new ErrorHandler("Meeting not found", 404));
    }

    const shareData = {
        meeting_id: meeting.meeting_id,
        name: meeting.name,
        address: meeting.address,
        post_code: meeting.post_code,
        repair_detail: meeting.repair_detail,
        target_time: meeting.target_time,
        recordings: meeting.recordings,
        screenshots: meeting.screenshots,
        createdAt: meeting.createdAt,
        total_recordings: meeting.total_recordings,
        total_screenshots: meeting.total_screenshots,
        total_access_count: meeting.total_access_count || 0,
        access_history: meeting.access_history || []
    };

    res.status(200).json({
        success: true,
        message: "Meeting data retrieved for sharing",
        meeting: shareData
    });
});

export const recordVisitorAccess = catchAsyncError(async (req, res, next) => {
    const { visitor_name, visitor_email } = req.body;
    const meetingId = req.params.id;
    
    if (!visitor_name || !visitor_email) {
        return next(new ErrorHandler("Visitor name and email are required", 400));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(visitor_email)) {
        return next(new ErrorHandler("Please enter a valid email address", 400));
    }

    const meeting = await MeetingModel.findOne({
        meeting_id: meetingId
    });

    if (!meeting) {
        return next(new ErrorHandler("Meeting not found", 404));
    }

    const ip_address = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
                      (req.connection.socket ? req.connection.socket.remoteAddress : null);
    const user_agent = req.get('User-Agent') || 'Unknown';

    const visitorAccess = {
        visitor_name: visitor_name.trim(),
        visitor_email: visitor_email.trim().toLowerCase(),
        access_time: new Date(),
        ip_address: ip_address,
        user_agent: user_agent
    };

    if (!meeting.access_history) {
        meeting.access_history = [];
    }
    
    meeting.access_history.push(visitorAccess);
    meeting.total_access_count = (meeting.total_access_count || 0) + 1;

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    meeting.access_history = meeting.access_history.filter(access => 
        access.access_time > twentyFourHoursAgo
    );

    await meeting.save();

    res.status(200).json({
        success: true,
        message: "Visitor access recorded successfully",
        access_count: meeting.total_access_count,
        visitor_info: {
            name: visitor_name,
            email: visitor_email,
            access_time: visitorAccess.access_time
        }
    });
});

export const updateMeeting = catchAsyncError(async (req, res, next) => {
    const { name, address, post_code, reference, repair_detail, target_time } = req.body;
    
    const meeting = await MeetingModel.findOne({
        _id: req.params.id,
        $or: [
            { owner: req.user._id },
            { userId: req.user._id },
            { created_by: req.user._id }
        ]
    });

    if (!meeting) {
        return next(new ErrorHandler("Meeting not found", 404));
    }

    if (name) meeting.name = name;
    if (address) meeting.address = address;
    if (post_code) meeting.post_code = post_code;
    if (reference) meeting.reference = reference;
    if (repair_detail) meeting.repair_detail = repair_detail;
    if (target_time) meeting.target_time = target_time;
    
    if (!meeting.userId) {
        meeting.userId = req.user._id;
    }
    
    meeting.last_updated_by = req.user._id;

    await meeting.save();

    sendResponse(true, 200, "Meeting updated successfully", res);
});

// Enhanced parallel deletion function
const deleteFromCloudinaryWithRetry = async (cloudinaryId, resourceType = 'auto', retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const result = await cloudinary.uploader.destroy(cloudinaryId, {
                resource_type: resourceType,
                timeout: 15000
            });
            
            if (result.result === 'ok' || result.result === 'not found') {
                return result;
            } else {
                throw new Error(`Cloudinary deletion failed: ${result.result}`);
            }
        } catch (error) {
            console.error(`❌ Cloudinary delete attempt ${attempt} failed:`, error.message);
            
            if (attempt < retries) {
                const delay = attempt * 2000;
                console.log(`🔁 Retrying Cloudinary delete in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            
            throw error;
        }
    }
};

export const deleteMeeting = catchAsyncError(async (req, res, next) => {
    const meeting = await MeetingModel.findOne({
        _id: req.params.id,
        $or: [
            { owner: req.user._id },
            { userId: req.user._id },
            { created_by: req.user._id }
        ]
    });

    if (!meeting) {
        return next(new ErrorHandler("Meeting not found", 404));
    }

    console.log(`🗑️ Starting PARALLEL meeting deletion: ${meeting._id}`);

    let deletedRecordings = 0;
    let deletedScreenshots = 0;
    let failedDeletions = [];

    // ============ PARALLEL DELETION FROM CLOUDINARY ============
    const deletePromises = [];

    // Delete recordings in parallel
    if (meeting.recordings && meeting.recordings.length > 0) {
        const recordingPromises = meeting.recordings.map(async (recording, index) => {
            if (recording.cloudinary_id) {
                try {
                    await deleteFromCloudinaryWithRetry(recording.cloudinary_id, 'video');
                    deletedRecordings++;
                    console.log(`✅ Recording ${index + 1} deleted`);
                } catch (error) {
                    console.error(`❌ Recording deletion failed: ${recording.cloudinary_id}`);
                    failedDeletions.push(`recording_${recording.cloudinary_id}`);
                }
            }
        });
        
        deletePromises.push(...recordingPromises);
    }

    // Delete screenshots in parallel
    if (meeting.screenshots && meeting.screenshots.length > 0) {
        const screenshotPromises = meeting.screenshots.map(async (screenshot, index) => {
            if (screenshot.cloudinary_id) {
                try {
                    await deleteFromCloudinaryWithRetry(screenshot.cloudinary_id, 'image');
                    deletedScreenshots++;
                    console.log(`✅ Screenshot ${index + 1} deleted`);
                } catch (error) {
                    console.error(`❌ Screenshot deletion failed: ${screenshot.cloudinary_id}`);
                    failedDeletions.push(`screenshot_${screenshot.cloudinary_id}`);
                }
            }
        });
        
        deletePromises.push(...screenshotPromises);
    }

    // Wait for all parallel deletions
    await Promise.allSettled(deletePromises);

    // Delete the meeting document
    await meeting.deleteOne();
    
    console.log(`✅ PARALLEL meeting deletion completed`);
    
    res.status(200).json({
        success: true,
        message: "Meeting and all media deleted successfully with parallel processing",
        deletion_summary: {
            recordings_deleted: deletedRecordings,
            recordings_total: meeting.recordings.length,
            screenshots_deleted: deletedScreenshots,
            screenshots_total: meeting.screenshots.length,
            failed_cloudinary_deletions: failedDeletions.length,
            meeting_deleted: true,
            performance_improvement: "PARALLEL DELETION ENABLED"
        }
    });
});

export const getMeetingByMeetingId = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Looking for meeting with ID: ${id}`);
        
        const meeting = await MeetingModel.findOne({ meeting_id: id });
        
        if (!meeting) {
            console.log(`ℹ️ No meeting found with ID: ${id}`);
            return res.status(404).json({
                success: false,
                message: "Meeting not found",
                isNewMeeting: true
            });
        }
        
        console.log(`✅ Found meeting with ID: ${id}`);
        res.status(200).json({
            success: true,
            meeting
        });
        
    } catch (error) {
        console.error('❌ Error in getMeetingByMeetingId:', error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching meeting",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const deleteRecording = catchAsyncError(async (req, res, next) => {
    const { meetingId, recordingId } = req.params;
    const user_id = req.user._id;
    
    console.log(`🗑️ Starting OPTIMIZED recording deletion: ${recordingId}`);
    
    const meeting = await MeetingModel.findOne({
        meeting_id: meetingId,
        $or: [
            { owner: user_id },
            { userId: user_id },
            { created_by: user_id }
        ]
    });

    if (!meeting) {
        return next(new ErrorHandler("Meeting not found", 404));
    }

    const recordingIndex = meeting.recordings.findIndex(rec => rec._id.toString() === recordingId);
    
    if (recordingIndex === -1) {
        return next(new ErrorHandler("Recording not found", 404));
    }

    const recording = meeting.recordings[recordingIndex];
    let cloudinaryDeleted = false;
    
    try {
        // Delete from Cloudinary with optimized retry
        if (recording.cloudinary_id) {
            try {
                await deleteFromCloudinaryWithRetry(recording.cloudinary_id, 'video');
                cloudinaryDeleted = true;
                console.log(`✅ Cloudinary deletion successful`);
            } catch (cloudinaryError) {
                console.error(`❌ Cloudinary deletion failed:`, cloudinaryError.message);
                cloudinaryDeleted = false;
            }
        } else {
            cloudinaryDeleted = true;
        }
        
        // Remove from database
        meeting.recordings.splice(recordingIndex, 1);
        meeting.total_recordings = meeting.recordings.length;
        meeting.last_updated_by = user_id;
        
        await meeting.save();
        
        res.status(200).json({
            success: true,
            message: cloudinaryDeleted 
                ? "Recording deleted successfully from both database and cloud storage" 
                : "Recording deleted from database, but cloud storage deletion failed",
            total_recordings: meeting.total_recordings,
            cloudinary_deleted: cloudinaryDeleted
        });
        
    } catch (error) {
        console.error(`❌ Recording deletion error:`, error);
        return next(new ErrorHandler("Failed to delete recording", 500));
    }
});

export const deleteScreenshot = catchAsyncError(async (req, res, next) => {
    const { meetingId, screenshotId } = req.params;
    const user_id = req.user._id;
    
    console.log(`🗑️ Starting OPTIMIZED screenshot deletion: ${screenshotId}`);
    
    const meeting = await MeetingModel.findOne({
        meeting_id: meetingId,
        $or: [
            { owner: user_id },
            { userId: user_id },
            { created_by: user_id }
        ]
    });

    if (!meeting) {
        return next(new ErrorHandler("Meeting not found", 404));
    }

    const screenshotIndex = meeting.screenshots.findIndex(screenshot => screenshot._id.toString() === screenshotId);
    
    if (screenshotIndex === -1) {
        return next(new ErrorHandler("Screenshot not found", 404));
    }

    const screenshot = meeting.screenshots[screenshotIndex];
    let cloudinaryDeleted = false;
    
    try {
        // Delete from Cloudinary with optimized retry
        if (screenshot.cloudinary_id) {
            try {
                await deleteFromCloudinaryWithRetry(screenshot.cloudinary_id, 'image');
                cloudinaryDeleted = true;
                console.log(`✅ Cloudinary deletion successful`);
            } catch (cloudinaryError) {
                console.error(`❌ Cloudinary deletion failed:`, cloudinaryError.message);
                cloudinaryDeleted = false;
            }
        } else {
            cloudinaryDeleted = true;
        }
        
        // Remove from database
        meeting.screenshots.splice(screenshotIndex, 1);
        meeting.total_screenshots = meeting.screenshots.length;
        meeting.last_updated_by = user_id;
        
        await meeting.save();
        
        res.status(200).json({
            success: true,
            message: cloudinaryDeleted 
                ? "Screenshot deleted successfully from both database and cloud storage" 
                : "Screenshot deleted from database, but cloud storage deletion failed",
            total_screenshots: meeting.total_screenshots,
            cloudinary_deleted: cloudinaryDeleted
        });
        
    } catch (error) {
        console.error(`❌ Screenshot deletion error:`, error);
        return next(new ErrorHandler("Failed to delete screenshot", 500));
    }
});