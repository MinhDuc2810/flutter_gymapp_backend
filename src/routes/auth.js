const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const {verifyToken} = require('../token');

//Route lấy thông tin 1 người dùng
router.get('/getuser', verifyToken, authController.getUser);

// Route chỉnh sửa profile
router.put('/updateuser/:userId', authController.updateUser);

// Route đổi mật khẩu
router.put('/changepassword/:userId', authController.changePassword);

// Route đăng ký
router.post('/login', authController.login);

// Route đăng nhập
router.post('/register', authController.register);



module.exports = router;