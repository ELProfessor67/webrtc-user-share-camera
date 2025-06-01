import mongoose from 'mongoose';
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";



// Define the User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, validate: validator.isEmail },
  password: { type: String, required: false, default: undefined },
  role: {type: String, enum: ['landlord','resident','admin'],default: 'landlord'},
  OTP: {type: String, default: undefined},
  logo: {type: String, default: undefined}
},{timestamps: true});


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Create models
const User = mongoose.model('User', userSchema);

export default User;
