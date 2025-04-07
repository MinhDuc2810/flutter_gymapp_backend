
const mongoose = require('mongoose');

const ptProfileSchema = new mongoose.Schema({
  ptId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gender: String,
  experience: String,
  certifications: [String],
  specialties: [String],
});

module.exports = mongoose.model('PTProfile', ptProfileSchema);
