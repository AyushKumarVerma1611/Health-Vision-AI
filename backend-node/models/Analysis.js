const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['ecg', 'xray', 'mri', 'heart', 'diabetes'],
    required: true,
  },
  inputData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  result: {
    prediction: { type: String, default: '' },
    confidence: { type: Number, default: 0 },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    heatmapUrl: { type: String, default: '' },
    riskPercentage: { type: Number, default: 0 },
    riskLevel: { type: String, default: '' },
    recommendations: [{ type: String }],
  },
  reportPdfUrl: {
    type: String,
    default: '',
  },
  scanImageUrl: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

analysisSchema.index({ userId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);
