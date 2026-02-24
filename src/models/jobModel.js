import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true
        },
        company:{
            type:String,
            required:true
        },
        location:{
            type:String,
            required:true
        },
        jobType:{
            type:String,
            enum:['full-time','part-time','contract','internship'],
            required:true
        },
        experienceLevel:{
            type:String,
            enum:['fresher','junior','senior'],
            required:true
        },
        createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        }
    }, { timestamps: true }
);
export default mongoose.model("Job", jobSchema);    
