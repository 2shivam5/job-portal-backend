import multer from 'multer';
import path from 'path';
import fs, { existsSync } from 'fs';
import e from 'express';

const uploadDir = path.join(process.cwd(), 'uploads','resume');

if (!fs.existsSync(uploadDir))fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination:(req,file,cb)=>cb(null,uploadDir),
        filename:(_req,file,cb)=>{
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`)  ;  
    }
});
const fileFilter=(req,file,cb)=>{
    if (file.mimetype !== "application/pdf")return cb(new Error("Only PDF files are allowed"));
    cb(null,true);

    };
    export const upload = multer({
        storage,
        fileFilter,
        limits:{ fileSize:5*1024*1024}
    });