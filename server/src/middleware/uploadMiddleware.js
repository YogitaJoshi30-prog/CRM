const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../../uploads/documents');

// Ensure base upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration with safe server-side filename generation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const caseId = req.params.id || req.body.caseId || 'general';
    // Sanitize case ID to prevent path traversal
    const safeCaseDir = caseId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const caseFolder = path.join(uploadDir, safeCaseDir);
    
    if (!fs.existsSync(caseFolder)) {
      fs.mkdirSync(caseFolder, { recursive: true });
    }
    
    cb(null, caseFolder);
  },
  filename: (req, file, cb) => {
    // Generate safe unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeBaseName}_${uniqueSuffix}${ext}`);
  }
});

// Allowed file extensions & MIME types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx', '.xls', '.xlsx'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (ALLOWED_MIME_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed formats: PDF, JPG, PNG, WEBP, DOC, DOCX, XLS, XLSX.`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 MB file size limit
  }
});

module.exports = upload;
