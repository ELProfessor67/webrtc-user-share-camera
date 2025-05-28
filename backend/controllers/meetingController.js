import catchAsyncError from '../middlewares/catchAsyncError.js';
import MeetingModel from '../models/meetings.js'; 
import sendResponse from '../utils/sendResponse.js';
import ErrorHandler from '../utils/errorHandler.js';
import sendEmail from '../utils/sendEmail.js';

export const create = catchAsyncError(async (req, res,next) => {
    const { meeting_id, name, address, post_code, repair_detail, target_time } = req.body;
    const user_id = req.user._id;
    // Validate required fields
    if (!meeting_id) {
        return next(new ErrorHandler("Meeting ID is required", 400));
    }

    // Check if meeting with same ID already exists
    const existingMeeting = await MeetingModel.findOne({ meeting_id });
    if (existingMeeting) {
        return next(new ErrorHandler("Meeting with this ID already exists", 400));
    }

    // Create new meeting
    const meeting = await MeetingModel.create({
        meeting_id,
        name,
        address,
        post_code,
        repair_detail,
        target_time,
        owner: user_id
    });
    
    // Send success response
    
    sendResponse(true,201, "Meeting created successfully", res);
}); 

// Get all meetings
export const getAllMeetings = catchAsyncError(async (req, res,next) => {
    const meetings = await MeetingModel.find({ owner: req.user._id });
    res.status(200).json({
        success: true,
        meetings
    })
});

// Get meeting by ID
export const getMeetingById = catchAsyncError(async (req, res, next) => {
    const meeting = await MeetingModel.findOne({
        _id: req.params.id,
        owner: req.user._id
    });

    if (!meeting) {
        return next(new ErrorHandler("Meeting not found", 404));
    }

    sendResponse(true, 200, "Meeting retrieved successfully", res);
});

// Update meeting
export const updateMeeting = catchAsyncError(async (req, res, next) => {
    const { name, address, post_code, repair_detail, target_time } = req.body;
    
    const meeting = await MeetingModel.findOne({
        _id: req.params.id,
        owner: req.user._id
    });

    if (!meeting) {
        return next(new ErrorHandler("Meeting not found", 404));
    }

    // Update fields if provided
    if (name) meeting.name = name;
    if (address) meeting.address = address;
    if (post_code) meeting.post_code = post_code;
    if (repair_detail) meeting.repair_detail = repair_detail;
    if (target_time) meeting.target_time = target_time;

    await meeting.save();

    sendResponse(true, 200, "Meeting updated successfully", res);
});

// Delete meeting
export const deleteMeeting = catchAsyncError(async (req, res, next) => {
    const meeting = await MeetingModel.findOne({
        _id: req.params.id,
        owner: req.user._id
    });

    if (!meeting) {
        return next(new ErrorHandler("Meeting not found", 404));
    }

    await meeting.deleteOne();

    sendResponse(true, 200, "Meeting deleted successfully",res);
});


