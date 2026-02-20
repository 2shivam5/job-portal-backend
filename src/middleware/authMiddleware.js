import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// export const protect = async (req, res, next) => {
//   console.log("AUTH HEADER:", req.headers.authorization);
// console.log("COOKIE TOKEN:", req.cookies?.token);

//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ success: false, message: "Token required" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
//     console.log("DECODED:", decoded);


//     const userId = decoded.userId; 
//     console.log("USER ID:", userId);

//     const user = await User.findById(decoded.userId).select("-password");
//     console.log("USER FROM DB:", user);

//     if (!user) return res.status(401).json({ success: false, message: "User not found" });
// console.log("AUTH USER:", req.user);

//     req.user = user; 
//     console.log("REQ.USER AFTER SET:", req.user);

//     next();
//   } catch (err) {
//     return res.status(401).json({ success: false, message: "Invalid token" });
//   }
// };

export const protect = async (req, res, next) => {
  console.log("AUTH HEADER:", req.headers.authorization);
  console.log("COOKIE TOKEN:", req.cookies?.token);

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    console.log("DECODED:", decoded);

    const userId = decoded.userId;
    console.log("USER ID:", userId);

    const user = await User.findById(userId).select("-password");
    console.log("USER FROM DB:", user);

    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    req.user = user;
    console.log("AUTH USER:", req.user);
    console.log("AUTH USER ID:", req.user._id.toString());

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token", error: err.message });
  }
};

export const mustBeVerified = (req,res,next)=>{
  const verified=req.user.isVerifiedCandidate;
  if(!verified){
    return res.status(403).json({success:false,message:"User not verified"});
  }
  next(); 
}
