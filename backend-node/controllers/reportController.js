const cloudinary = require('../config/cloudinary');
const UploadedReport = require('../models/UploadedReport');

const uploadReport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { description } = req.body;

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'healthvision/reports',
      resource_type: 'auto',
      public_id: `${req.user._id}_${Date.now()}`,
    });

    const report = await UploadedReport.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      fileUrl: uploadResult.secure_url,
      fileType: req.file.mimetype,
      description: description || '',
      cloudinaryPublicId: uploadResult.public_id,
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
      await cloudinary.uploader.destroy(report.cloudinaryPublicId);
    } catch (cloudErr) {
      console.error('Cloudinary delete error:', cloudErr.message);
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
