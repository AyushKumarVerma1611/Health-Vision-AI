const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const UploadedReport = require('../models/UploadedReport');

const AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:8000';

const uploadReport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { description } = req.body;
    
    // Save to local disk instead of Cloudinary
    const ext = path.extname(req.file.originalname) || '.pdf';
    const filename = `${req.user._id}_${Date.now()}${ext}`;
    const filePath = path.join(__dirname, '../uploads/reports', filename);
    
    // Ensure dir exists
    fs.mkdirSync(path.join(__dirname, '../uploads/reports'), { recursive: true });
    fs.writeFileSync(filePath, req.file.buffer);

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/reports/${filename}`;

    // --- INSTANT AI ANALYSIS ---
    let aiData = null;
    try {
      const formData = new FormData();
      formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const response = await axios.post(`${AI_URL}/predict/document`, formData, {
        headers: formData.getHeaders(),
        timeout: 120000, 
      });
      aiData = response.data;
    } catch (aiErr) {
      console.error('Failed to auto-analyze document:', aiErr.message);
      // We don't fail the upload just because AI analysis failed, but we log it.
    }

    const report = await UploadedReport.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      fileUrl: fileUrl,
      fileType: req.file.mimetype,
      description: description || '',
      cloudinaryPublicId: filename, // store local filename here
      aiAnalysis: aiData ? {
        prediction: aiData.prediction,
        confidence: aiData.confidence,
        description: aiData.description,
        recommendations: aiData.recommendations || []
      } : null
    });

    res.status(201).json({ report });
  } catch (error) {
    next(error);
  }
};

const getUserReports = async (req, res, next) => {
  try {
    const reports = await UploadedReport.find({ userId: req.user._id })
      .sort({ uploadedAt: -1 })
      .lean();

    res.json({ reports });
  } catch (error) {
    next(error);
  }
};

const deleteReport = async (req, res, next) => {
  try {
    const report = await UploadedReport.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    try {
      const filePath = path.join(__dirname, '../uploads/reports', report.cloudinaryPublicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fsErr) {
      console.error('File delete error:', fsErr.message);
    }

    await UploadedReport.findByIdAndDelete(report._id);

    res.json({ message: 'Report deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadReport,
  getUserReports,
  deleteReport,
};
