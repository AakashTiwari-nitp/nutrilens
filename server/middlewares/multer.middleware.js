import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), 'public', 'temp');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const imageOnly = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
};

export const upload = multer({
    storage: storage,
    fileFilter: imageOnly,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
