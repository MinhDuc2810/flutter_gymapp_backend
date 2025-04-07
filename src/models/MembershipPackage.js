const mongoose = require('mongoose');


const membershipPackageSchema = new mongoose.Schema({
  name: String,
  durationInDays: Number,
  price: Number,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MembershipPackage', membershipPackageSchema);
