import crypto from 'crypto';
import User from '../models/userModel.js';
import { sendMail } from '../utils/sendMail.js';
import eventBus from '../events/eventBus.js';

export const sendResetPasswordOtp = async (req,res)=>{
    const { email} = req.body;

  if (!email) {
    return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
    });
  }
  const user=await User.findOne({ email })

  if (!user) {
    return res.status(404).json({ 
        success: false, 
        message: "User not found with this email" 
    });
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpHash = crypto
  .createHash('sha256').
  update(otp).digest('hex');

user.resetOtp = otpHash;
user.otpVerifyStatus=false;
await user.save({ validateBeforeSave: false });

eventBus.emit("SendMail", {
    to: user.email,
    subject: "Password Reset OTP",
    text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`
});
console.log("EMITTING OTP MAIL:", user.email, otp);

return res.status(200).json({
    success:true,
    message:"OTP sent to email" 
});
}

export const verifyResetOtp =async(req,res)=>{
    const { email,otp} = req.body;

    const hashedOtp = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

    const user = await User.findOne({
        email,
        resetOtp: hashedOtp,
    })
    if (!user) {
        return res.status(400).json({
            success: false,
            message: "Invalid OTP"
        });
    }
    user.otpVerifyStatus=true;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
        success:true,
        message:"OTP verified successfully"
    });    
}

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (user.otpVerifyStatus !== true) {
    return res.status(400).json({
      success: false,
      message: "OTP not verified",
    });
  }

  user.password = newPassword;
  user.resetOtp = undefined;
  user.otpVerifyStatus = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
};