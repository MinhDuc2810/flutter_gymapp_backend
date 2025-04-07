const express = require('express');
const morgan = require('morgan');
const path = require('path'); // Thêm module path để xử lý đường dẫn
const app = express();
const port = 3000;
const db = require('./config');

db.connect();

app.use(express.json());
app.use(morgan('combined'));

// Cấu hình phục vụ file tĩnh từ thư mục 'images'
app.use('/images', express.static(path.join(__dirname, 'images')));

const router = require('./routes');
router(app);

app.listen(port, () => {
    console.log(`Server chạy tại http://localhost:${port}`);
});