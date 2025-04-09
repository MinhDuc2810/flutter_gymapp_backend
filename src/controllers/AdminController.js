const MembershipPackage = require('../models/MembershipPackage');
const User = require('../models/User');
const PTProfile = require('../models/PtProfile');
const CardMember = require('../models/CardMember');
const mongoose = require('mongoose');


class AdminController {
    // Lay danh sach gói tập
    async getPackages(req, res) {
        try {
            const packages = await MembershipPackage.find({ isActive: true });
            res.status(200).json(packages);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    //Thêm gói tập
    async addPackage(req, res) {
        try {
            const { name, durationInDays, price, description } = req.body;
            const newPackage = new MembershipPackage({
                name,
                durationInDays,
                price,
                description,
                isActive: true
            });
            await newPackage.save();
            res.status(201).json({ message: 'Membership package added successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }


    //Sửa gói tập

    async modifyPackage(req, res) {
        try {
            const { id } = req.params;
            const { name, durationInDays, price, description } = req.body;
            const membershipPackage = await MembershipPackage.findById(id);
            if (!membershipPackage) {
                return res.status(404).json({ message: 'Membership package not found' });
            }
            membershipPackage.name = name;
            membershipPackage.durationInDays = durationInDays;
            membershipPackage.price = price;
            membershipPackage.description = description;
            await membershipPackage.save();
            res.status(200).json({ message: 'Membership package modified successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }


    //Xoa gói tập
    async deletePackage(req, res) {
        try {
            const { id } = req.params;
            const membershipPackage = await MembershipPackage.findById(id);
            if (!membershipPackage) {
                return res.status(404).json({ message: 'Membership package not found' });
            }
            membershipPackage.isActive = false;
            await membershipPackage.save();
            res.status(200).json({ message: 'Membership package deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }


    //Lấy thông tin tất cả người dùng 
    getAllUsers(req, res) {
        User.find({ role: "user" })
            .select('username email phonenumber birthday')
            .then(user => {
                res.status(200).json(user);
            })
            .catch(error => {
                console.error(error);
                res.status(500).json({ message: 'Server error', error: error.message });
            });
    }



    //Thêm PT
    addPT = (req, res) => {
        // Lấy dữ liệu từ body của request
        const {
          username,
          email,
          phonenumber,
          birthday,
          password,
          gender,
          experience,
          certifications,
          specialties,
        } = req.body;
      
        // Kiểm tra dữ liệu bắt buộc
        if (!username || !email || !phonenumber || !birthday || !password) {
          return res.status(400).json({
            success: false,
            message: 'Thiếu các trường bắt buộc',
          });
        }
      
        // Chuyển certifications và specialties từ chuỗi thành mảng nếu có
        const certsArray = certifications ? certifications.split(',') : [];
        const specsArray = specialties ? specialties.split(',') : [];
      
        // Xử lý file ảnh (nếu có)
        let avatarUrl = '';
        if (req.file) {
          avatarUrl = `/images/${req.file.filename}`; // Lưu đường dẫn tương đối
        }
      
        // Tạo user mới với role là 'pt'
        const newUser = new User({
          username,
          email,
          phonenumber,
          birthday,
          password, // Nên mã hóa password trước khi lưu (dùng bcrypt)
          role: 'pt',
          avatarUrl, // Lưu đường dẫn ảnh vào trường avatarUrl
        });
      
        // Lưu user vào DB và xử lý bằng Promise
        newUser.save()
          .then(savedUser => {
            // Tạo profile cho PT
            const newPtProfile = new PTProfile({ // Sửa PtProfile thành PTProfile
              ptId: savedUser._id,
              gender: gender || '',
              experience: experience || '',
              certifications: certsArray,
              specialties: specsArray,
            });
      
            // Lưu profile vào DB
            return newPtProfile.save()
              .then(savedPtProfile => {
                // Trả về phản hồi thành công
                res.status(201).json({
                  success: true,
                  message: 'PT đã được thêm thành công',
                  data: {
                    user: savedUser,
                    ptProfile: savedPtProfile,
                  },
                });
              });
          })
          .catch(error => {
            console.error(error);
            res.status(500).json({
              success: false,
              message: 'Lỗi server: ' + error.message,
            });
          });
      };


      //Lấy thông tin tất cả PT
      getAllPt = (req, res) => {
        // Tìm tất cả users có role là 'pt' và chưa bị xóa mềm (isDeleted: false)
        User.find({ role: 'pt', isDeleted: false })
          .select('-password') // Loại bỏ trường password khỏi kết quả
          .then(ptUsers => {
            if (!ptUsers || ptUsers.length === 0) {
              return res.status(404).json({
                success: false,
                message: 'Không tìm thấy PT nào',
              });
            }
      
            // Lấy danh sách ptId từ ptUsers
            const ptIds = ptUsers.map(user => user._id);
      
            // Tìm tất cả PTProfile tương ứng với các ptId
            PTProfile.find({ ptId: { $in: ptIds } })
              .then(ptProfiles => {
                // Kết hợp thông tin User và PTProfile
                const ptList = ptUsers.map(user => {
                  const profile = ptProfiles.find(p => p.ptId.toString() === user._id.toString());
                  return {
                    user: {
                      _id: user._id,
                      username: user.username,
                      email: user.email,
                      phonenumber: user.phonenumber,
                      birthday: user.birthday,
                      avatarUrl: user.avatarUrl,
                    },
                    profile: profile ? {
                      gender: profile.gender,
                      experience: profile.experience,
                      certifications: profile.certifications,
                      specialties: profile.specialties,
                    } : null,
                  };
                });
      
                // Trả về danh sách PT
                res.status(200).json({
                  success: true,
                  message: 'Lấy danh sách PT thành công',
                  data: ptList,
                });
              })
              .catch(error => {
                console.error(error);
                res.status(500).json({
                  success: false,
                  message: 'Lỗi server: ' + error.message,
                });
              });
          })
          .catch(error => {
            console.error(error);
            res.status(500).json({
              success: false,
              message: 'Lỗi server: ' + error.message,
            });
          });
      };


      //Xóa PT
      deletePt = (req, res) => {
        const ptId = req.params.id;
      
        User.findById(ptId)
          .then(user => {
            if (!user || user.role !== 'pt') {
              return res.status(404).json({
                success: false,
                message: 'Không tìm thấy PT nào',
              });
            }
      
            // Xóa mềm PT
            user.softDelete()
              .then(() => {
                res.status(200).json({
                  success: true,
                  message: 'Xóa PT thành cong',
                });
              })
              .catch(error => {
                console.error(error);
                res.status(500).json({
                  success: false,
                  message: 'Lỗi server: ' + error.message,
                });
              });
          })
          .catch(error => {
            console.error(error);
            res.status(500).json({
              success: false,
              message: 'Lỗi server: ' + error.message,
            });
          });
      };


  //Lấy thông tin tất cả thẻ tập
  async getAllCardMembers(req, res) {
    try {
      const cardMembers = await CardMember.find({ status: { $ne: 'cancelled' } })
        .populate('userId', 'username phonenumber')
        .exec();
  
      // Transform dữ liệu
      const result = cardMembers.map(card => {
        // Tách thông tin user
        const user = {
          username: card.userId.username,
          phonenumber: card.userId.phonenumber
        };
  
        // Tạo object cardMember không chứa userId
        const cardMember = {
          id: card._id,
          status: card.status,
          packageId: card.packageId, // nếu có
          startDate: card.startDate, // nếu có
          endDate: card.endDate      // nếu có
          // thêm các field khác của CardMember nếu cần
        };
  
        return { user, cardMember };
      });
  
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getAllCardMembers:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = new AdminController();