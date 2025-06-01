import express from 'express';
const router = express.Router();
import {changePassword, loadme, login, logout, register, updateUser,forgotPassword,resetPassword, verify} from './controllers/authController.js';
import {isAuthenticate} from "./middlewares/auth.js"
import { create, getAllMeetings, getMeetingById, updateMeeting, deleteMeeting } from './controllers/meetingController.js';

// auth routes
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/verify').post(verify);
router.route('/me').get(isAuthenticate,loadme);
router.route('/logout').get(logout);
router.route('/user/update').put(isAuthenticate,updateUser);
router.route('/user/change-password').put(isAuthenticate,changePassword);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').put(resetPassword);

// meeting routes
router.route('/meetings/create').post(isAuthenticate, create);
router.route('/meetings/all').get(isAuthenticate, getAllMeetings);
router.route('/meetings/:id').get(isAuthenticate, getMeetingById);
router.route('/meetings/:id').put(isAuthenticate, updateMeeting);
router.route('/meetings/:id').delete(isAuthenticate, deleteMeeting);

export default router;