import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {  name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['candidate','recruiter','admin'],
        default:'candidate',
    },
    resume: { 
        type: String,
         default: null 
        },

    isBlocked:{
        type:Boolean,
        default:false,
    },
    isVerifiedCandidate:{
        type:Boolean,
        default:false,
    },
    resetOtp:String,
    otpVerifyStatus:{
        type:Boolean,
        default:false,
    }
  }, { timestamps: true }   
);

userSchema.pre("save", async function () {
  if (!this.isModified("password"));

  this.password = await bcrypt.hash(this.password, 10);
});
const User= mongoose.model("User", userSchema);

export default User;