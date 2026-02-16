import mongoose from "mongoose";
import User from "./userModel.js";

const interViewSchema= new mongoose.Schema(
    {
        scheduleAt:{
            type:Date,
            required:true
        },
        mode:{
            type:String,
            enum:['offline','online'],
            required:true
        },
        meetingLink:{
            type:String
        },
        location:{
            type:String
        } ,
        note:{
            type:String
        },
        scheduleBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:User,
            required:true
        },
        status:{
            type:String,
            enum: ["scheduled", "rescheduled", "cancelled", "completed"],
            default: "scheduled",
        },
        cancleReason:{
            type:String,
            default:null
        },
       history: [
  {
    action: {
      type: String,
      enum: ["SCHEDULED", "RESCHEDULED", "MODE_CHANGED", "CANCELLED"],
      required: true,
    },
    oldValue: { 
        type: Object,
         default: {}
         },
    newValue: { 
        type: Object,
         default: {}
         },
    changedBy: {
         type: mongoose.Schema.Types.ObjectId,
          ref: "User", 
          required: true },
    changedAt: { 
        type: Date,
         default: Date.now
         },
  },
],

    },
        {_id:false}     
);

const statusHistorySchema= new mongoose.Schema(
{
    status:{
        type:String,
      enum: ["applied", "shortlisted", "interView", "rejected", "hired"],
      required:true
    },
    changedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User,
        required:true
    },
    note:{
        type:String
    },
},
{_id:false}
);


const applicationSchema = new mongoose.Schema(
    {
        jobId: {    
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        resumeUrl: {
            type: String,
            required: true,
        },
        jobTitle: {
            type: String,
        },
         company: {
            type: String,
        },
        status: {
            type: String,
            enum: ["applied", "shortlisted","interView", "rejected", "hired"],
            default: "applied",
        },
        interView: { type: interViewSchema },
        statusHistory: { type: [statusHistorySchema], default: [] },
        lastStatusChangedAt: { type: Date, default: Date.now },
     },
    { timestamps: true }
);
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application;