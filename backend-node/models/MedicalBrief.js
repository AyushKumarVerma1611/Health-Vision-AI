const mongoose = require('mongoose');

const medicalBriefSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  summaryText: {
    type: String,
    required: true,
  },
  pdfUrl: {
    type: String,
    default: '',
  },
  dataUsed: {
    chatCount: { type: Number, default: 0 },
    analysisCount: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

medicalBriefSchema.index({ userId: 1, generatedAt: -1 });

module.exports = mongoose.model('MedicalBrief', medicalBriefSchema);
