import mongoose from "mongoose"
import User from "./userModel.js"
import { application } from "express";
import jobModel from "./jobModel.js"
const profileViewSchema = new mongoose.Schema(
    {
        candidateId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
            index:true
        },
        recruiterId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
            index:true
        },
        // jobId:{
        //     type:mongoose.Schema.Types.ObjectId,
        //     ref:"Job",
        //     index:true,
        //     default:null
        // },
        // applicationId:{
        //     type:mongoose.Schema.Types.ObjectId,
        //     ref:"application",
        //     index:true,
        //     default:null
        // },
        viewedAt:{
            type:Date,
            default:Date.now,
            index:true
        },
        ip:{
            type:String,
            default:null
        },
        userAgent:{
            type:String,
            default:null
        }
    },
    {timestamps:true}
);
profileViewSchema.index(
    {candidateId:1,recruiterId:1,viewedAt:1},
    { name: "candidate_recruiter_viewedAt_idx" }
);
export default mongoose.model("ProfileView",profileViewSchema);