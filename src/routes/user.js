const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

// Route xử lý thanh toán
router.post('/processPayment', userController.processPayment);

// Route lấy thông tin thẻ hệ thống
router.get('/getCardMember', userController.getCardMember);

module.exports = router;