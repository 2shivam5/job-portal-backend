import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";


export const regUser=async(req,res)=>{
    try {
        const {name,email,password,role}=req.body;
        const existingUser=await User.findOne({email});

        if(!name || !email || !password){
            return res.status(400)
            .json({
                success:false,
                message:"All fields are required"
            });
        };
        if (role !== 'candidate' && role !== 'recruiter' && role !== 'admin') {
            return res.status(400)
            .json({
                success:false,
                message:"Invalid role"
            });
        }
        if(existingUser){
            return res.status(400)
            .json({
                success:false,
                message:"User already exist"
            });
        };

        const hashedPassword=await bcrypt.hash(password,10);
       
        const newUser=new User({
            name,
            email,
            password:hashedPassword,
            role
        });
        await newUser.save();
        res.status(201).json({
            success:true,
            message:"User registered successfully",
            user:newUser
        });
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Internal server error"
        });     
    };
};

export const loginUser = async(req,res)=>{

    const {email,password}=req.body;

    const user = await User.findOne({email});

    if(!user){
        return res.status(400).json({
            success:false,
            message:"Invalid email or password"
        })
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.status(400).json({
            success:false,
            message:"Invalid email or password",
        })
    }
const token=jwt.sign(
    {
        userId:user._id,
        email:user.email,
        role:user.role
    },
    process.env.JWT_ACCESS_SECRET,
    {expiresIn:'5h'}
)

    res.json({
        success:true,
        message:"Login successful",
        role:user.role,
        token
    });    
};

