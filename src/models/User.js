const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // Sử dụng bcryptjs để mã hóa mật khẩu

// Định nghĩa schema người dùng
const User = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phonenumber: { type: String, required: true, unique: true },
    birthday: { type: String, required: true },
    password: { type: String, required: true },
    role : {type : String, enum : ['user', 'admin', 'pt'] },
    avatarUrl: { type: String },
    isDeleted: { type: Boolean, default: false },  // Trường isDeleted để đánh dấu xóa mềm
    deletedAt: { type: Date, default: null },  // Trường deletedAt để lưu ngày giờ xóa
});

// Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
User.pre('save', async function(next) {
    if (!this.isModified('password')) return next();  // Nếu mật khẩu chưa thay đổi, bỏ qua
    const salt = await bcrypt.genSalt(10);  // Tạo salt
    this.password = await bcrypt.hash(this.password, salt);  // Mã hóa mật khẩu
    next();
});

// Tạo phương thức xác thực mật khẩu
User.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password);  // So sánh mật khẩu
};

// Phương thức để xóa mềm người dùng
User.methods.softDelete = function() {
    this.isDeleted = true;
    this.deletedAt = new Date();  // Lưu ngày giờ xóa
    return this.save();  // Lưu thay đổi
};

module.exports = mongoose.model('User', User);
