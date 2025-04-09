const CardMember = require('../models/CardMember');
const MembershipPackage = require('../models/MembershipPackage');
const User = require('../models/User');
const mongoose = require('mongoose');

class UserController {

  // Xử lý thanh toán  
  async processPayment (req, res)  {
    const { userId, packageId } = req.body;
    
    try {
      // Lấy thông tin gói tập
      const membershipPackage = await MembershipPackage.findById(packageId);
      if (!membershipPackage || !membershipPackage.isActive) {
        throw new Error('Gói tập không tồn tại hoặc không hoạt động');
      }
  
      // Tìm thẻ hiện tại
      const currentDate = new Date();
      let cardMember = await CardMember.findOne({ userId, status: { $ne: 'cancelled' } });
      const durationInDays = membershipPackage.durationInDays;
  
      if (!cardMember || new Date(cardMember.endDate) < currentDate) {
        // Tạo thẻ mới nếu không có hoặc hết hạn
        cardMember = new CardMember({
          userId,
          packageId,
          startDate: currentDate,
          endDate: new Date(currentDate.getTime() + durationInDays * 24 * 60 * 60 * 1000),
          status: 'active',
        });
      } else {
        // Cộng dồn thời gian nếu thẻ còn hạn
        const newEndDate = new Date(cardMember.endDate);
        newEndDate.setDate(newEndDate.getDate() + durationInDays);
        cardMember.endDate = newEndDate;
        cardMember.status = 'active';
      }
  
      // Lưu và trả về kết quả
      const savedCardMember = await cardMember.save();
      res.status(200).json({ success: true, cardMember: savedCardMember });
      
    } catch (error) {
      console.error('Lỗi khi xử lý thanh toán:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }


  //Lấy thông tin thẻ hệ thống
  getCardMember(req, res) {
    const { userId } = req.query; // Lấy userId từ query string

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }

    CardMember.findOne({ userId, status: { $ne: 'cancelled' } })
      .populate('packageId', 'name price durationInDays description')
      .then(cardMember => {
        if (!cardMember) {
          return res.status(404).json({
            success: false,
            message: 'No active card member found for this user'
          });
        }
        res.status(200).json({
          success: true,
          cardMember: {
            _id: cardMember._id,
            startDate: cardMember.startDate,
            endDate: cardMember.endDate,
            status: cardMember.status,
            
          }
        });
      })
      .catch(err => {
        console.error('Error in getCardMember:', err);
        res.status(500).json({ success: false, message: err.message });
      });
  }
}


module.exports = new UserController();