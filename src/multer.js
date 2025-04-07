const multer = require('multer');
const path = require('path');

// Cấu hình multer để lưu file vào thư mục src/images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/images'); // Thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`); // Tạo tên file duy nhất
  },
});

const upload = multer({ storage: storage });

module.exports = upload;