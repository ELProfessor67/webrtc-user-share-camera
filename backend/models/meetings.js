import mongoose from 'mongoose';


// Define the User schema
const userSchema = new mongoose.Schema({
    meeting_id: {type: String,required: true,unique: true},
    name: {type: String},
    address: {type: String},
    post_code: {type: String},
    repair_detail: {type: String},
    target_time: {type: String},
    owner: {type: mongoose.Schema.ObjectId,ref: "User"}
},{timestamps: true});




// Create models
const Meeting = mongoose.model('Meeting', userSchema);
export default Meeting;
