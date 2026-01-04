const multer = require('multer');
const path = require('path');

// FIX: Add file type presets
const FILE_TYPES = {
    PDF: ['application/pdf'],
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    IMAGES_AND_PDF: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf'
    ]
};

function createUploader(
    allowedFiles = FILE_TYPES.IMAGES,
    uploadPath = "src/public/uploads/",
    fileSizeLimit = 5 * 1024 * 1024
) {
    let mimeTypes = allowedFiles;
    if (typeof allowedFiles === 'string') {
        mimeTypes = FILE_TYPES[allowedFiles.toUpperCase()];
        if (!mimeTypes) {
            throw new Error(
                `Unknown file type: ${allowedFiles}. Available: ${Object.keys(FILE_TYPES).join(', ')}`
            );
        }
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadPath); 
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
        }
    });

    const fileFilter = (req, file, cb) => {
        if (mimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(`Invalid file type. Allowed: ${mimeTypes.join(", ")}`),
                false
            );
        }
    };

    return multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: {
            fileSize: fileSizeLimit
        }
    });
}

module.exports = createUploader;
module.exports.FILE_TYPES = FILE_TYPES;