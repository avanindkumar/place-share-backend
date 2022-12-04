const multer = require("multer");

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
