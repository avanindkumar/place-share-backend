const { S3 } = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { v4: uuid } = require("uuid");
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

const storage = multer.memoryStorage();

const fileUpload = multer({
  limits: 500000,
  storage,
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : Error("Invalid mime type!");
    cb(error, isValid);
  },
});

module.exports = fileUpload;
