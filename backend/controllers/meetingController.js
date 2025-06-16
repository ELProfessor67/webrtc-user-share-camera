import catchAsyncError from '../middlewares/catchAsyncError.js';
import MeetingModel from '../models/meetings.js';
import sendResponse from '../utils/sendResponse.js';
import ErrorHandler from '../utils/errorHandler.js';
import sendEmail from '../utils/sendEmail.js';
import { v2 as cloudinary } from 'cloudinary';
import path from "path"
import fs from "fs"
import os from "os"

// Configure cloudinary with optimized settings
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    timeout: parseInt(process.env.CLOUDINARY_UPLOAD_TIMEOUT) || 60000,
    chunk_size: parseInt(process.env.CLOUDINARY_CHUNK_SIZE) || 6000000
});

// Progress tracking utility
const createProgressTracker = (totalFiles, meetingId, userId) => {
    let completedFiles = 0;
    let failedFiles = 0;
    
    const updateProgress = (success = true) => {
        if (success) {
            completedFiles++;
        } else {
            failedFiles++;
        }
        
        const totalProcessed = completedFiles + failedFiles;
        const successPercentage = totalFiles > 0 ? Math.round((completedFiles / totalFiles) * 100) : 100;
        const overallPercentage = totalFiles > 0 ? Math.round((totalProcessed / totalFiles) * 100) : 100;
        
        console.log(`📊 [Meeting: ${meetingId}] [User: ${userId}] Progress: ${overallPercentage}% (${totalProcessed}/${totalFiles}) | Success: ${successPercentage}% (${completedFiles}/${totalFiles}) | Failed: ${failedFiles}`);
        
        return {
            totalFiles,
            completedFiles,
            failedFiles,
            totalProcessed,
            successPercentage,
            overallPercentage,
            isComplete: totalProcessed >= totalFiles
        };
    };
    
    return { updateProgress, getStats: () => ({ completedFiles, failedFiles, totalFiles }) };
};

// Helper function to validate file size with faster checking
const validateFileSize = (base64Data, maxSizeMB = 50) => {
    const sizeInBytes = (base64Data.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);

    console.log(`📏 File size: ${sizeInMB.toFixed(2)}MB`);

    if (sizeInMB > maxSizeMB) {
        throw new ErrorHandler(`File size (${sizeInMB.toFixed(2)}MB) exceeds maximum (${maxSizeMB}MB)`, 413);
    }

    return sizeInMB;
};

// Helper function to validate and fix timestamp
const validateTimestamp = (timestamp) => {
    if (!timestamp) return new Date();
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
        console.log(`⚠️ Invalid timestamp received: ${timestamp}, using current time`);
        return new Date();
    }
    return date;
};

// Optimized upload function with retry logic and progress tracking
const uploadToCloudinary = async (data, options, retries = 2, progressCallback = null) => {
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            console.log(`🔄 Upload attempt ${attempt}...`);
            const startTime = Date.now();
            let result;
            
            if (options.resource_type == "video") {
                const tempFilePath = path.join(os.tmpdir(), `temp-video-${Date.now()}.webm`);

                try {
                    console.log(`📁 Creating temporary file: ${tempFilePath}`);
                    fs.writeFileSync(tempFilePath, data, 'base64');
                    console.log(`📤 Uploading temporary file to Cloudinary...`);

                    result = await cloudinary.uploader.upload(tempFilePath, {
                        ...options,
                        timeout: parseInt(process.env.CLOUDINARY_UPLOAD_TIMEOUT) || 60000,
                        resource_type: "raw"
                    });

                    console.log(`🗑️ Cleaning up temporary file...`);
                } catch (uploadError) {
                    console.error(`❌ Error during video upload:`, uploadError.message);
                    throw uploadError;
                } finally {
                    try {
                        if (fs.existsSync(tempFilePath)) {
                            fs.unlinkSync(tempFilePath);
                            console.log(`✅ Temporary file deleted successfully`);
                        }
                    } catch (deleteError) {
                        console.warn(`⚠️ Warning: Could not delete temporary file ${tempFilePath}:`, deleteError.message);
                    }
                }
            } else {
                result = await cloudinary.uploader.upload(data, {
                    ...options,
                    timeout: parseInt(process.env.CLOUDINARY_UPLOAD_TIMEOUT) || 60000
                });
            }

            const duration = Date.now() - startTime;
            console.log(`✅ Upload successful in ${duration}ms`);
            
            // Update progress on success
            if (progressCallback) {
                progressCallback(true);
            }

            return result;
        } catch (error) {
            console.log(error)
            console.error(`❌ Upload attempt ${attempt} failed:`, error.message);

            if (attempt <= retries && (error.code === 'ETIMEDOUT' || error.message.includes('timeout'))) {
                console.log(`🔁 Retrying in 1 second... (${retries - attempt + 1} retries left)`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }

            // Update progress on failure
            if (progressCallback) {
                progressCallback(false);
            }
            
            throw error;
        }
    }
};

// Parallel batch processor with real-time progress
const processFilesInParallel = async (files, fileType, meetingId, userId, uploadFunction, maxConcurrency = 3) => {
    if (!files || files.length === 0) return [];
    
    console.log(`🚀 [${fileType.toUpperCase()}] Starting parallel processing of ${files.length} files with max concurrency: ${maxConcurrency}`);
    
    const progressTracker = createProgressTracker(files.length, meetingId, userId);
    const results = [];
    const batches = [];
    
    // Create batches for controlled concurrency
    for (let i = 0; i < files.length; i += maxConcurrency) {
        batches.push(files.slice(i, i + maxConcurrency));
    }
    
    console.log(`📦 [${fileType.toUpperCase()}] Created ${batches.length} batches for processing`);
    
    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`🔄 [${fileType.toUpperCase()}] Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} files)`);
        
        const batchPromises = batch.map(async (file, localIndex) => {
            const globalIndex = batchIndex * maxConcurrency + localIndex;
            
            try {
                return await uploadFunction(file, globalIndex, progressTracker.updateProgress);
            } catch (error) {
                console.error(`❌ [${fileType.toUpperCase()}] Failed to process file ${globalIndex + 1}:`, error.message);
                progressTracker.updateProgress(false);
                return null;
            }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        const stats = progressTracker.getStats();
        const batchProgress = Math.round(((batchIndex + 1) / batches.length) * 100);
        console.log(`✅ [${fileType.toUpperCase()}] Batch ${batchIndex + 1}/${batches.length} completed (${batchProgress}%)`);
        console.log(`📊 [${fileType.toUpperCase()}] Current stats: ${stats.completedFiles}/${stats.totalFiles} successful, ${stats.failedFiles} failed`);
    }
    
    const finalStats = progressTracker.getStats();
    console.log(`🎯 [${fileType.toUpperCase()}] Final Results: ${finalStats.completedFiles}/${finalStats.totalFiles} successful, ${finalStats.failedFiles} failed`);
    
    return results.filter(result => result !== null);
};

export const create = catchAsyncError(async (req, res, next) => {
    const { 
        meeting_id, 
        name, 
        address, 
        address_line_1,
        address_line_2, 
        address_line_3,
        additional_address_lines,
        post_code, 
        phone_number,
        reference, 
        repair_detail, 
        work_details,
        target_time, 
        special_notes,
        recordings, 
        screenshots, 
        update_mode 
    } = req.body;
    const user_id = req.user._id;

    const startTime = Date.now();
    const totalFiles = (recordings?.length || 0) + (screenshots?.length || 0);
    
    console.log(`🎬 [${new Date().toISOString()}] Starting meeting ${update_mode || 'creation'}...`);    console.log('👤 User ID:', user_id);
    console.log('📋 Meeting data:', { 
        meeting_id, 
        name, 
        address, 
        address_line_1,
        address_line_2,
        address_line_3,
        additional_address_lines,
        post_code, 
        phone_number,
        reference, 
        repair_detail, 
        work_details,
        target_time,
        special_notes
    });
    console.log(`📊 Total files to process: ${totalFiles} (${recordings?.length || 0} recordings, ${screenshots?.length || 0} screenshots)`);

    // Validate required fields
    if (!meeting_id) {
        return next(new ErrorHandler("Meeting ID is required", 400));
    }

    // Check if meeting exists
    const existingMeeting = await MeetingModel.findOne({ meeting_id });
    if (existingMeeting) {
        console.log('⚠️ Meeting exists, updating with NEW media only...');
        if (!existingMeeting.userId) {
            console.log('🔧 Setting missing userId for existing meeting...');
            existingMeeting.userId = user_id;
        }
        return await updateMeetingWithNewMediaOnly(existingMeeting, req.body, res, next, user_id, req);
    }

    // Setup parallel processing functions
    const processRecording = async (recording, index, progressCallback) => {
        console.log(`📹 Processing recording ${index + 1}/${recordings.length} for user ${user_id}...`);
        
        try {
            validateFileSize(recording.data, 100);
            const recordingData = recording.data.split(",")[2];
            
            const uploadResult = await uploadToCloudinary(recordingData, {
                folder: 'videodesk_recordings',
                public_id: `recording_${meeting_id}_${user_id}_${Date.now()}_${index}`,
                resource_type: 'video',
                transformation: [
                    { quality: 'auto:low' },
                    { fetch_format: 'auto' }
                ]
            }, 2, progressCallback);

            console.log(`✅ Recording ${index + 1} uploaded: ${uploadResult.secure_url.substring(0, 50)}...`);

            return {
                url: uploadResult.secure_url,
                cloudinary_id: uploadResult.public_id,
                timestamp: validateTimestamp(recording.timestamp),
                duration: recording.duration || 0,
                size: uploadResult.bytes || 0,
                uploaded_by: user_id
            };
        } catch (error) {
            console.error(`❌ Recording ${index + 1} failed:`, error.message);
            throw error;
        }
    };

    const processScreenshot = async (screenshot, index, progressCallback) => {
        console.log(`🖼️ Processing screenshot ${index + 1}/${screenshots.length} for user ${user_id}...`);
        
        try {
            validateFileSize(screenshot.data, 25);

            const uploadResult = await uploadToCloudinary(screenshot.data, {
                folder: 'videodesk_screenshots',
                public_id: `screenshot_${meeting_id}_${user_id}_${Date.now()}_${index}`,
                resource_type: 'image',
                transformation: [
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' },
                    { width: 1280, height: 720, crop: 'limit' }
                ]
            }, 2, progressCallback);

            console.log(`✅ Screenshot ${index + 1} uploaded: ${uploadResult.secure_url.substring(0, 50)}...`);

            return {
                url: uploadResult.secure_url,
                cloudinary_id: uploadResult.public_id,
                timestamp: validateTimestamp(screenshot.timestamp),
                size: uploadResult.bytes || 0,
                uploaded_by: user_id
            };
        } catch (error) {
            console.error(`❌ Screenshot ${index + 1} failed:`, error.message);
            throw error;
        }
    };

    try {
        console.log(`🚀 Starting parallel file processing...`);
        
        // Create overall progress tracker for all files
        const overallProgressTracker = createProgressTracker(totalFiles, meeting_id, user_id);
        
        // Enhanced upload functions with overall progress tracking
        const processRecordingWithOverallProgress = async (recording, index, localProgressCallback) => {
            const result = await processRecording(recording, index, (success) => {
                localProgressCallback(success);
                overallProgressTracker.updateProgress(success);
            });
            return result;
        };
        
        const processScreenshotWithOverallProgress = async (screenshot, index, localProgressCallback) => {
            const result = await processScreenshot(screenshot, index, (success) => {
                localProgressCallback(success);
                overallProgressTracker.updateProgress(success);
            });
            return result;
        };
        
        // Process recordings and screenshots in parallel with controlled concurrency
        const [savedRecordings, savedScreenshots] = await Promise.all([
            processFilesInParallel(recordings, 'recordings', meeting_id, user_id, processRecordingWithOverallProgress, 2),
            processFilesInParallel(screenshots, 'screenshots', meeting_id, user_id, processScreenshotWithOverallProgress, 3)
        ]);

        console.log(`📊 Upload Summary - Recordings: ${savedRecordings.length}/${recordings?.length || 0}, Screenshots: ${savedScreenshots.length}/${screenshots?.length || 0}`);
        
        // Final progress summary
        const finalOverallStats = overallProgressTracker.getStats();
        console.log(`🎯 [RECORDINGS] Final Results: ${savedRecordings.length}/${recordings?.length || 0} successful, ${(recordings?.length || 0) - savedRecordings.length} failed`);
        console.log(`🎯 [SCREENSHOTS] Final Results: ${savedScreenshots.length}/${screenshots?.length || 0} successful, ${(screenshots?.length || 0) - savedScreenshots.length} failed`);
        console.log(`📈 Overall Success Rate: ${finalOverallStats.totalFiles > 0 ? Math.round((finalOverallStats.completedFiles / finalOverallStats.totalFiles) * 100) : 100}% (${finalOverallStats.completedFiles}/${finalOverallStats.totalFiles} files)`);
        console.log(`⚡ Total processing time: ${Date.now() - startTime}ms`);        // Create meeting with all data
        const meeting = await MeetingModel.create({
            meeting_id,
            name,
            address,
            address_line_1,
            address_line_2,
            address_line_3,
            additional_address_lines: additional_address_lines || [],
            post_code,
            phone_number,
            reference,
            repair_detail,
            work_details: work_details || [],
            target_time,
            special_notes,
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
        const successRate = totalFiles > 0 ? Math.round(((savedRecordings.length + savedScreenshots.length) / totalFiles) * 100) : 100;
        
        console.log(`✅ Meeting created successfully in ${totalTime}ms`);
        console.log(`📈 Overall Success Rate: ${successRate}% (${savedRecordings.length + savedScreenshots.length}/${totalFiles} files)`);
        console.log(`🏷️ Meeting saved with reference: "${reference}" and post_code: "${post_code}"`);

        res.status(201).json({
            success: true,
            message: "Meeting created successfully",
            meeting: meeting,
            upload_summary: {
                total_time: `${totalTime}ms`,
                success_rate: `${successRate}%`,
                recordings_uploaded: savedRecordings.length,
                recordings_attempted: recordings?.length || 0,
                screenshots_uploaded: savedScreenshots.length,
                screenshots_attempted: screenshots?.length || 0,
                total_files_processed: savedRecordings.length + savedScreenshots.length,
                total_files_attempted: totalFiles,
                created_by: user_id
            },
            user_message_settings: req.user?.messageSettings
        });

    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error(`❌ Meeting creation failed after ${totalTime}ms:`, error.message);

        // Cleanup any uploaded files
        const allUploaded = [...(savedRecordings || []), ...(savedScreenshots || [])];
        await cleanupUploadedFiles(allUploaded);

        if (error.statusCode === 413) {
            return next(error);
        }

        return next(new ErrorHandler(`Upload failed after ${totalTime}ms. Please try with smaller files.`, 500));
    }
});

// Updated helper function for updating existing meetings with parallel processing
const updateMeetingWithNewMediaOnly = async (meeting, data, res, next, user_id, req) => {
    const { 
        name, 
        address, 
        address_line_1,
        address_line_2,
        address_line_3,
        additional_address_lines,
        post_code, 
        phone_number,
        reference, 
        repair_detail, 
        work_details,
        target_time, 
        special_notes,
        recordings, 
        screenshots 
    } = data;
    const totalNewFiles = (recordings?.length || 0) + (screenshots?.length || 0);

    console.log(`🔄 Updating existing meeting with ${totalNewFiles} new files...`);
    console.log(`📋 Current state - Recordings: ${meeting.recordings.length}, Screenshots: ${meeting.screenshots.length}`);

    try {
        // Update basic fields
        if (name !== undefined) meeting.name = name;
        if (address !== undefined) meeting.address = address;
        if (address_line_1 !== undefined) meeting.address_line_1 = address_line_1;
        if (address_line_2 !== undefined) meeting.address_line_2 = address_line_2;
        if (address_line_3 !== undefined) meeting.address_line_3 = address_line_3;
        if (additional_address_lines !== undefined) meeting.additional_address_lines = additional_address_lines;
        if (post_code !== undefined) meeting.post_code = post_code;
        if (phone_number !== undefined) meeting.phone_number = phone_number;
        if (reference !== undefined) meeting.reference = reference;
        if (repair_detail !== undefined) meeting.repair_detail = repair_detail;
        if (work_details !== undefined) meeting.work_details = work_details;
        if (target_time !== undefined) meeting.target_time = target_time;
        if (special_notes !== undefined) meeting.special_notes = special_notes;

        if (!meeting.userId) {
            console.log('🔧 Setting missing userId for existing meeting...');
            meeting.userId = user_id;
        }
        meeting.last_updated_by = user_id;

        // Setup progress tracking for updates
        const globalProgressTracker = createProgressTracker(totalNewFiles, meeting.meeting_id, user_id);
        console.log(`🎯 [UPDATE] Starting parallel processing of ${totalNewFiles} new files...`);

        // Process new recordings
        let newRecordingsCount = 0;
        if (recordings && recordings.length > 0) {
            console.log(`🎥 Processing ${recordings.length} new recordings...`);
            
            const recordingPromises = recordings.map(async (recording, i) => {
                try {
                    validateFileSize(recording.data, 100);
                    const recordingData = recording.data.split(",")[2];
                    
                    const uploadResult = await uploadToCloudinary(recordingData, {
                        folder: 'videodesk_recordings',
                        public_id: `recording_${meeting.meeting_id}_${user_id}_${Date.now()}_${i}`,
                        resource_type: 'video',
                        transformation: [
                            { quality: 'auto:low' },
                            { fetch_format: 'auto' }
                        ]
                    }, 2, globalProgressTracker.updateProgress);

                    meeting.recordings.push({
                        url: uploadResult.secure_url,
                        cloudinary_id: uploadResult.public_id,
                        timestamp: validateTimestamp(recording.timestamp),
                        duration: recording.duration || 0,
                        size: uploadResult.bytes || 0,
                        uploaded_by: user_id
                    });

                    newRecordingsCount++;
                    console.log(`✅ New recording ${i + 1} added successfully`);
                } catch (error) {
                    console.error(`❌ Error uploading new recording ${i + 1}:`, error);
                    globalProgressTracker.updateProgress(false);
                }
            });

            await Promise.all(recordingPromises);
        }

        // Process new screenshots
        let newScreenshotsCount = 0;
        if (screenshots && screenshots.length > 0) {
            console.log(`📸 Processing ${screenshots.length} new screenshots...`);
            
            const screenshotPromises = screenshots.map(async (screenshot, i) => {
                try {
                    validateFileSize(screenshot.data, 25);

                    const uploadResult = await uploadToCloudinary(screenshot.data, {
                        folder: 'videodesk_screenshots',
                        public_id: `screenshot_${meeting.meeting_id}_${user_id}_${Date.now()}_${i}`,
                        resource_type: 'image',
                        transformation: [
                            { quality: 'auto:good' },
                            { fetch_format: 'auto' },
                            { width: 1280, height: 720, crop: 'limit' }
                        ]
                    }, 2, globalProgressTracker.updateProgress);

                    meeting.screenshots.push({
                        url: uploadResult.secure_url,
                        cloudinary_id: uploadResult.public_id,
                        timestamp: validateTimestamp(screenshot.timestamp),
                        size: uploadResult.bytes || 0,
                        uploaded_by: user_id
                    });

                    newScreenshotsCount++;
                    console.log(`✅ New screenshot ${i + 1} added successfully`);
                } catch (error) {
                    console.error(`❌ Error uploading new screenshot ${i + 1}:`, error);
                    globalProgressTracker.updateProgress(false);
                }
            });

            await Promise.all(screenshotPromises);
        }

        // Update totals and save
        meeting.total_recordings = meeting.recordings.length;
        meeting.total_screenshots = meeting.screenshots.length;

        await meeting.save();

        const finalStats = globalProgressTracker.getStats();
        const successRate = totalNewFiles > 0 ? Math.round(((newRecordingsCount + newScreenshotsCount) / totalNewFiles) * 100) : 100;

        console.log(`✅ Meeting updated successfully`);
        console.log(`🎯 [UPDATE RECORDINGS] Final Results: ${newRecordingsCount}/${recordings?.length || 0} successful, ${(recordings?.length || 0) - newRecordingsCount} failed`);
        console.log(`🎯 [UPDATE SCREENSHOTS] Final Results: ${newScreenshotsCount}/${screenshots?.length || 0} successful, ${(screenshots?.length || 0) - newScreenshotsCount} failed`);
        console.log(`📈 Update Success Rate: ${successRate}% (${newRecordingsCount + newScreenshotsCount}/${totalNewFiles} new files)`);
        console.log(`📊 Final totals - Recordings: ${meeting.total_recordings}, Screenshots: ${meeting.total_screenshots}`);

        res.status(200).json({
            success: true,
            message: "Meeting updated successfully with new media files",
            meeting: meeting,
            media_summary: {
                success_rate: `${successRate}%`,
                total_recordings_count: meeting.recordings.length,
                total_screenshots_count: meeting.screenshots.length,
                new_recordings_added: newRecordingsCount,
                new_screenshots_added: newScreenshotsCount,
                new_files_attempted: totalNewFiles,
                new_files_successful: newRecordingsCount + newScreenshotsCount,
                updated_by: user_id,
                meeting_userId: meeting.userId
            },
            user_message_settings: req.user?.messageSettings
        });

    } catch (error) {
        console.error(`❌ Error updating meeting:`, error);
        if (error.statusCode === 413) {
            return next(error);
        }
        return next(new ErrorHandler("Failed to update meeting with new media. Please try with smaller files.", 500));
    }
};

// Optimized cleanup function
const cleanupUploadedFiles = async (uploadedFiles) => {
    if (uploadedFiles.length === 0) return;

    console.log(`🧹 Cleaning up ${uploadedFiles.length} files...`);

    const deletePromises = uploadedFiles.map(async (file) => {
        try {
            await cloudinary.uploader.destroy(file.cloudinary_id);
            console.log(`🗑️ Deleted: ${file.cloudinary_id}`);
        } catch (error) {
            console.error(`❌ Delete failed: ${file.cloudinary_id}`, error.message);
        }
    });

    await Promise.all(deletePromises);
    console.log('✅ Cleanup completed');
};

// Rest of the controller functions remain the same...
// (getAllMeetings, archiveMeeting, etc. - keeping them as they were in the original code)

// Get all meetings with media (filter by userId and archive status)
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

    console.log(`✅ Found ${meetings.length} meetings for user ${user_id} (archived: ${archived})`);

    res.status(200).json({
        success: true,
        meetings,
        total_meetings: meetings.length,
        user_id: user_id,
        filter: archived ? `archived: ${archived}` : 'all meetings'
    });
});

// Archive meeting
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

    console.log(`📦 Archiving meeting: ${meeting._id} by user ${req.user._id}`);

    meeting.archived = true;
    meeting.archivedAt = new Date();
    meeting.archivedBy = req.user._id;
    meeting.last_updated_by = req.user._id;

    await meeting.save();

    console.log(`✅ Meeting archived successfully: ${meeting._id}`);

    res.status(200).json({
        success: true,
        message: "Meeting archived successfully",
        meeting: meeting
    });
});

// Unarchive meeting
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

    console.log(`📤 Unarchiving meeting: ${meeting._id} by user ${req.user._id}`);

    meeting.archived = false;
    meeting.archivedAt = null;
    meeting.archivedBy = null;
    meeting.last_updated_by = req.user._id;

    await meeting.save();

    console.log(`✅ Meeting unarchived successfully: ${meeting._id}`);

    res.status(200).json({
        success: true,
        message: "Meeting unarchived successfully",
        meeting: meeting
    });
});

// Get archived meetings count
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

// Get meeting by ID
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

// Get meeting by ID for sharing (public access) - Updated to return history
export const getMeetingForShare = catchAsyncError(async (req, res, next) => {
    const meeting = await MeetingModel.findOne({
        meeting_id: req.params.id
    });

    if (!meeting) {
        return next(new ErrorHandler("Meeting not found", 404));
    }

    // Return limited data for sharing (exclude sensitive info)
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

    console.log(`👤 Recording visitor access for meeting: ${meetingId}`, {
        visitor_name,
        visitor_email
    });

    // Validate required fields
    if (!visitor_name || !visitor_email) {
        return next(new ErrorHandler("Visitor name and email are required", 400));
    }

    // Validate email format
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

    // Get client information
    const ip_address = req.ip || req.connection.remoteAddress || req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);
    const user_agent = req.get('User-Agent') || 'Unknown';

    // Create visitor access record - NO CACHE CHECKS
    const visitorAccess = {
        visitor_name: visitor_name.trim(),
        visitor_email: visitor_email.trim().toLowerCase(),
        access_time: new Date(),
        ip_address: ip_address,
        user_agent: user_agent
    };

    // Add to access history
    if (!meeting.access_history) {
        meeting.access_history = [];
    }

    meeting.access_history.push(visitorAccess);
    meeting.total_access_count = (meeting.total_access_count || 0) + 1;

    // ============ CLEANUP OLD ACCESS RECORDS ============
    // Remove access records older than 24 hours to keep database clean
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    meeting.access_history = meeting.access_history.filter(access =>
        access.access_time > twentyFourHoursAgo
    );

    await meeting.save();

    console.log(`✅ Visitor access recorded successfully:`, {
        meeting_id: meetingId,
        visitor: visitor_name,
        email: visitor_email,
        total_access: meeting.total_access_count
    });

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

// Update meeting
export const updateMeeting = catchAsyncError(async (req, res, next) => {
    const { 
        name, 
        address, 
        address_line_1,
        address_line_2,
        address_line_3,
        additional_address_lines,
        post_code, 
        phone_number,
        reference, 
        repair_detail, 
        work_details,
        target_time,
        special_notes
    } = req.body;

    console.log('🔄 Updating meeting with fields:', { 
        name, 
        address, 
        address_line_1,
        address_line_2,
        address_line_3,
        additional_address_lines,
        post_code, 
        phone_number,
        reference, 
        repair_detail, 
        work_details,
        target_time,
        special_notes
    });

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

    // Update fields if provided
    if (name !== undefined) meeting.name = name;
    if (address !== undefined) meeting.address = address;
    if (address_line_1 !== undefined) meeting.address_line_1 = address_line_1;
    if (address_line_2 !== undefined) meeting.address_line_2 = address_line_2;
    if (address_line_3 !== undefined) meeting.address_line_3 = address_line_3;
    if (additional_address_lines !== undefined) meeting.additional_address_lines = additional_address_lines;
    if (post_code !== undefined) meeting.post_code = post_code; // Actual postcode
    if (phone_number !== undefined) meeting.phone_number = phone_number;
    if (reference !== undefined) meeting.reference = reference; // Reference field
    if (repair_detail !== undefined) meeting.repair_detail = repair_detail;
    if (work_details !== undefined) meeting.work_details = work_details;
    if (target_time !== undefined) meeting.target_time = target_time;
    if (special_notes !== undefined) meeting.special_notes = special_notes;

    // Ensure userId is set if missing
    if (!meeting.userId) {
        meeting.userId = req.user._id;
    }

    meeting.last_updated_by = req.user._id;    await meeting.save();

    console.log(`✅ Meeting updated successfully with all new fields`);

    sendResponse(true, 200, "Meeting updated successfully", res);
});

// Delete meeting with all associated media
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

    console.log(`🗑️ [${new Date().toISOString()}] Starting complete meeting deletion: ${meeting._id} by user ${req.user._id}`);
    console.log(`📊 Meeting contains: ${meeting.recordings.length} recordings, ${meeting.screenshots.length} screenshots`);

    let deletedRecordings = 0;
    let deletedScreenshots = 0;
    let failedDeletions = [];

    // Delete all recordings from Cloudinary in parallel
    if (meeting.recordings && meeting.recordings.length > 0) {
        console.log(`🎥 Deleting ${meeting.recordings.length} recordings from Cloudinary...`);

        const recordingPromises = meeting.recordings.map(async (recording, index) => {
            if (recording.cloudinary_id) {
                try {
                    await deleteFromCloudinaryWithRetry(recording.cloudinary_id, 'video');
                    deletedRecordings++;
                    console.log(`✅ Recording ${index + 1}/${meeting.recordings.length} deleted from Cloudinary`);
                } catch (error) {
                    console.error(`❌ Failed to delete recording ${recording.cloudinary_id}:`, error.message);
                    failedDeletions.push(`recording_${recording.cloudinary_id}`);
                }
            }
        });

        await Promise.all(recordingPromises);
    }

    // Delete all screenshots from Cloudinary in parallel
    if (meeting.screenshots && meeting.screenshots.length > 0) {
        console.log(`📸 Deleting ${meeting.screenshots.length} screenshots from Cloudinary...`);

        const screenshotPromises = meeting.screenshots.map(async (screenshot, index) => {
            if (screenshot.cloudinary_id) {
                try {
                    await deleteFromCloudinaryWithRetry(screenshot.cloudinary_id, 'image');
                    deletedScreenshots++;
                    console.log(`✅ Screenshot ${index + 1}/${meeting.screenshots.length} deleted from Cloudinary`);
                } catch (error) {
                    console.error(`❌ Failed to delete screenshot ${screenshot.cloudinary_id}:`, error.message);
                    failedDeletions.push(`screenshot_${screenshot.cloudinary_id}`);
                }
            }
        });

        await Promise.all(screenshotPromises);
    }

    // Delete the meeting document from database
    await meeting.deleteOne();

    console.log(`✅ Meeting deleted successfully from database`);
    console.log(`📊 Cloudinary cleanup results - Recordings: ${deletedRecordings}/${meeting.recordings.length}, Screenshots: ${deletedScreenshots}/${meeting.screenshots.length}`);

    if (failedDeletions.length > 0) {
        console.log(`⚠️ Some Cloudinary files failed to delete: ${failedDeletions.join(', ')}`);
    }

    res.status(200).json({
        success: true,
        message: "Meeting and all associated media deleted successfully",
        deletion_summary: {
            recordings_deleted: deletedRecordings,
            recordings_total: meeting.recordings.length,
            screenshots_deleted: deletedScreenshots,
            screenshots_total: meeting.screenshots.length,
            failed_cloudinary_deletions: failedDeletions.length,
            meeting_deleted: true
        }
    });
});

// Get meeting by meeting_id (for admin to fetch existing data)
export const getMeetingByMeetingId = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Looking for meeting with ID: ${id}`);

        // Use MeetingModel instead of Meeting
        const meeting = await MeetingModel.findOne({ meeting_id: id });

        if (!meeting) {
            console.log(`ℹ️ No meeting found with ID: ${id} (This is normal for new meetings)`);
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

// Improved helper function for Cloudinary deletion with better retry logic
const deleteFromCloudinaryWithRetry = async (cloudinaryId, resourceType = 'auto', retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`🔄 Cloudinary delete attempt ${attempt}/${retries} for: ${cloudinaryId} (type: ${resourceType})`);
            const startTime = Date.now();

            const result = await cloudinary.uploader.destroy(cloudinaryId, {
                resource_type: resourceType,
                timeout: 15000 // 15 second timeout
            });

            const duration = Date.now() - startTime;
            console.log(`✅ Cloudinary delete successful in ${duration}ms, result: ${result.result}`);

            if (result.result === 'ok' || result.result === 'not found') {
                return result;
            } else {
                throw new Error(`Cloudinary deletion failed: ${result.result}`);
            }
        } catch (error) {
            console.error(`❌ Cloudinary delete attempt ${attempt} failed:`, error.message);

            if (attempt < retries) {
                const delay = attempt * 2000; // Increasing delay: 2s, 4s, 6s
                console.log(`🔁 Retrying Cloudinary delete in ${delay}ms... (${retries - attempt} retries left)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            console.error(`❌ All Cloudinary delete attempts failed for ${cloudinaryId}`);
            throw error;
        }
    }
};

// Delete individual recording with guaranteed Cloudinary removal
export const deleteRecording = catchAsyncError(async (req, res, next) => {
    const { meetingId, recordingId } = req.params;
    const user_id = req.user._id;

    console.log(`🗑️ [${new Date().toISOString()}] Starting recording deletion: ${recordingId} from meeting ${meetingId} by user ${user_id}`);

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

    // Find the recording to delete
    const recordingIndex = meeting.recordings.findIndex(rec => rec._id.toString() === recordingId);

    if (recordingIndex === -1) {
        return next(new ErrorHandler("Recording not found", 404));
    }

    const recording = meeting.recordings[recordingIndex];
    console.log(`📹 Found recording to delete:`, {
        cloudinary_id: recording.cloudinary_id,
        url: recording.url,
        size: recording.size
    });

    let cloudinaryDeleted = false;

    try {
        // First, delete from Cloudinary with aggressive retry
        if (recording.cloudinary_id) {
            console.log(`☁️ Attempting to delete from Cloudinary: ${recording.cloudinary_id}`);

            try {
                await deleteFromCloudinaryWithRetry(recording.cloudinary_id, 'video');
                cloudinaryDeleted = true;
                console.log(`✅ Successfully deleted from Cloudinary: ${recording.cloudinary_id}`);
            } catch (cloudinaryError) {
                console.error(`❌ Failed to delete from Cloudinary after all retries:`, cloudinaryError.message);
                // Continue with database deletion even if Cloudinary fails
                cloudinaryDeleted = false;
            }
        } else {
            console.log(`⚠️ No Cloudinary ID found for recording`);
            cloudinaryDeleted = true; // No Cloudinary file to delete
        }

        // Remove from database
        meeting.recordings.splice(recordingIndex, 1);
        meeting.total_recordings = meeting.recordings.length;
        meeting.last_updated_by = user_id;

        await meeting.save();

        console.log(`✅ Recording deleted from database successfully. Total recordings: ${meeting.total_recordings}`);

        res.status(200).json({
            success: true,
            message: cloudinaryDeleted
                ? "Recording deleted successfully from both database and cloud storage"
                : "Recording deleted from database, but cloud storage deletion failed",
            total_recordings: meeting.total_recordings,
            cloudinary_deleted: cloudinaryDeleted
        });

    } catch (error) {
        console.error(`❌ Error in recording deletion process:`, error);
        return next(new ErrorHandler("Failed to delete recording", 500));
    }
});

// Delete individual screenshot with guaranteed Cloudinary removal
export const deleteScreenshot = catchAsyncError(async (req, res, next) => {
    const { meetingId, screenshotId } = req.params;
    const user_id = req.user._id;

    console.log(`🗑️ [${new Date().toISOString()}] Starting screenshot deletion: ${screenshotId} from meeting ${meetingId} by user ${user_id}`);

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

    // Find the screenshot to delete
    const screenshotIndex = meeting.screenshots.findIndex(screenshot => screenshot._id.toString() === screenshotId);

    if (screenshotIndex === -1) {
        return next(new ErrorHandler("Screenshot not found", 404));
    }

    const screenshot = meeting.screenshots[screenshotIndex];
    console.log(`📸 Found screenshot to delete:`, {
        cloudinary_id: screenshot.cloudinary_id,
        url: screenshot.url,
        size: screenshot.size
    });

    let cloudinaryDeleted = false;

    try {
        // First, delete from Cloudinary with aggressive retry
        if (screenshot.cloudinary_id) {
            console.log(`☁️ Attempting to delete from Cloudinary: ${screenshot.cloudinary_id}`);

            try {
                await deleteFromCloudinaryWithRetry(screenshot.cloudinary_id, 'image');
                cloudinaryDeleted = true;
                console.log(`✅ Successfully deleted from Cloudinary: ${screenshot.cloudinary_id}`);
            } catch (cloudinaryError) {
                console.error(`❌ Failed to delete from Cloudinary after all retries:`, cloudinaryError.message);
                // Continue with database deletion even if Cloudinary fails
                cloudinaryDeleted = false;
            }
        } else {
            console.log(`⚠️ No Cloudinary ID found for screenshot`);
            cloudinaryDeleted = true; // No Cloudinary file to delete
        }

        // Remove from database
        meeting.screenshots.splice(screenshotIndex, 1);
        meeting.total_screenshots = meeting.screenshots.length;
        meeting.last_updated_by = user_id;

        await meeting.save();

        console.log(`✅ Screenshot deleted from database successfully. Total screenshots: ${meeting.total_screenshots}`);

        res.status(200).json({
            success: true,
            message: cloudinaryDeleted
                ? "Screenshot deleted successfully from both database and cloud storage"
                : "Screenshot deleted from database, but cloud storage deletion failed",
            total_screenshots: meeting.total_screenshots,
            cloudinary_deleted: cloudinaryDeleted
        });

    } catch (error) {
        console.error(`❌ Error in screenshot deletion process:`, error);
        return next(new ErrorHandler("Failed to delete screenshot", 500));
    }
});