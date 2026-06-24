import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// backend/src/config/ → ../../ → backend/uploads/avatars
const AVATAR_DIR = path.resolve(__dirname, '../../uploads/avatars');

const PRODUCT_IMAGES_DIR = path.resolve(
  __dirname,
  '../../uploads/productsImgs'
);

// Ensure directory exists at startup
if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

if (!fs.existsSync(PRODUCT_IMAGES_DIR)) {
  fs.mkdirSync(PRODUCT_IMAGES_DIR, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    // Use user_id so re-uploads simply overwrite the old file
    cb(null, `${req.user.user_id}${ext}`);
  },
});

const productImagesStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, PRODUCT_IMAGES_DIR);
  },

  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';

    cb(null, `${crypto.randomUUID()}${ext}`); // To make every file name unique
  },
});


const imageFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP and GIF images are allowed'), false);
  }
};

// Maximum files: 5
// Maximum size per file: 5 MB
// Field name: product_images
export const uploadProductImages = multer({
  storage: productImagesStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).array('product_images', 5);

/** Single avatar upload — max 2 MB */
export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
}).single('avatar');
