const mongoose = require('mongoose');

const uploadedReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  aiAnalysis: {
    prediction: String,
    confidence: Number,
    description: String,
    recommendations: [String],
  }
});

uploadedReportSchema.index({ userId: 1, uploadedAt: -1 });

module.exports = mongoose.model('UploadedReport', uploadedReportSchema);
