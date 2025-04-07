    const User = require('../models/User');
    const jwt = require('jsonwebtoken');
    const bcrypt = require('bcryptjs'); 
  

    class AuthController {
        // Đăng ký người dùng
        register(req, res) {
            const { username, email,phonenumber,birthday, password } = req.body;

            User.findOne({ email })
                .then(userExists => {
                    if (userExists) {
                        return res.status(400).json({ message: 'User already exists' });
                    }

                    const user = new User({ username, email,phonenumber,birthday, password, role: 'user' });

                    return user.save()
                        .then(() => {
                        
                            res.status(200).json({ message: 'User registered successfully' });
                        })
                        .catch(error => {
                            res.status(500).json({ message: 'Error saving user', error: error.message });
                        });
                })
                .catch(error => {
                    res.status(500).json({ message: 'Server Error', error: error.message });
                });
        }

       // Đăng nhập người dùng
       login(req, res) {
        const { email, password } = req.body;
    
        User.findOne({ email })
            .then(user => {
                if (!user) {
                    return res.status(400).json({ message: 'Invalid credentials' });
                }
    
                return user.matchPassword(password)
                    .then(isMatch => {
                        if (!isMatch) {
                            return res.status(400).json({ message: 'Invalid credentials' });
                        }
    
                        const token = jwt.sign(
                            { id: user._id, role: user.role }, 
                            'secretKey',
                            { expiresIn: '1h' }
                        );
                        
                        // Chỉ gửi token, bỏ phần user data
                        res.status(200).json({
                            message: 'Login successful',
                            token
                        });
                    })
                    .catch(error => {
                        res.status(500).json({ message: 'Error checking password', error: error.message });
                    });
            })
            .catch(error => {
                res.status(500).json({ message: 'Server Error', error: error.message });
            });
    }


        //Đổi mật khẩu
        changePassword = (req, res) => {
            const { oldPassword, newPassword } = req.body;
            const { userId } = req.params;
          
            User.findById(userId)
              .then(user => {
                if (!user) {
                  return res.status(404).json({ message: 'User not found' });
                }
          
                user.matchPassword(oldPassword)
                  .then(isMatch => {
                    if (!isMatch) {
                      return res.status(400).json({ message: 'Invalid old password' });
                    }
          
                    if (oldPassword === newPassword) {
                      return res.status(400).json({ message: 'New password must be different from old password' });
                    }
          
                    // Cập nhật mật khẩu mới
                    user.password = newPassword;
          
                    // Middleware `pre('save')` sẽ tự hash password
                    user.save()
                      .then(() => {
                        res.status(200).json({ message: 'Password changed successfully' });
                      })
                      .catch(error => {
                        res.status(500).json({ message: 'Error saving user', error: error.message });
                      });
          
                  })
                  .catch(error => {
                    res.status(500).json({ message: 'Error checking password', error: error.message });
                  });
              })
              .catch(error => {
                res.status(500).json({ message: 'Server error', error: error.message });
              });
          };


          //Chinh sua thong tin nguoi dung
          updateUser = (req, res) => {
            const { userId } = req.params;
            const { username, email, phonenumber, birthday } = req.body;
          
            User.findById(userId)
              .then(user => {
                if (!user) {
                  return res.status(404).json({ message: 'User not found' });
                }
          
                user.username = username;
                user.email = email;
                user.phonenumber = phonenumber;
                user.birthday = birthday;
          
                user.save()
                  .then(() => {
                    res.status(200).json({ message: 'User updated successfully' });
                  })
                  .catch(error => {
                    res.status(500).json({ message: 'Error saving user', error: error.message });
                  });
              })
              .catch(error => {
                res.status(500).json({ message: 'Server error', error: error.message });
              });
          };


           // lấy thông tin 1 ngươi dùng
           getUser(req, res) {
            // Lấy userId từ req.user thay vì req.params
            const userId = req.user.id; // Giả sử verifyToken gắn id vào req.user.id
        
            User.findById(userId)
                .select('username email phonenumber birthday role') // Chọn các field cần thiết
                .then(user => {
                    if (!user) {
                        return res.status(404).json({ message: 'User not found' });
                    }
                    res.status(200).json({
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        phonenumber: user.phonenumber,
                        birthday: user.birthday,
                        role: user.role
                    });
                })
                .catch(error => {
                    res.status(500).json({ message: 'Server Error', error: error.message });
                });
        }

        
        
    }

    module.exports = new AuthController;