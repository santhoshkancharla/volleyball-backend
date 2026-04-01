const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

let storage;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'placeholder') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'volleytrack',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    }
  });
} else {
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const fs = require('fs');
      if (!fs.existsSync('./uploads')){
          fs.mkdirSync('./uploads');
      }
      cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
}

const upload = multer({ storage });
module.exports = upload;
