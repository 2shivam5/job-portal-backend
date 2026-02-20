// export const requireRoles=(...allowdRoles)=>{
//     return (req,res,next)=>{
//         if (!req.user) {
//             return res.status(401).json({
//                   success: false,
//         message: "Unauthorized: Login required",
//             })
//         }
//         const userRole=req.user.role
//         if (allowdRoles.includes(userRole)) {
//             return res.status(403).json({
//         success: false,
//         message: `Forbidden: Only ${allowdRoles.join(", ")} can access`,
//         });
//         }
//         next();
//     };
// };
export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: req.user missing (protect not working or token missing)",
    });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Forbidden: Only ${allowedRoles.join(", ")} can access`,
    });
  }

  next();
};
