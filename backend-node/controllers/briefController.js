const axios = require('axios');
const Chat = require('../models/Chat');
const Analysis = require('../models/Analysis');
const UploadedReport = require('../models/UploadedReport');
const MedicalBrief = require('../models/MedicalBrief');

const AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:8000';

const generateBrief = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({ userId }).lean();
    const analyses = await Analysis.find({ userId }).lean();
    const reports = await UploadedReport.find({ userId }).lean();

    const chatSummary = chats.map((c) => ({
      title: c.title,
      messages: c.messages.map((m) => ({ role: m.role, content: m.content })),
    }));

    const analysisSummary = analyses.map((a) => ({
      type: a.type,
      prediction: a.result.prediction,
      confidence: a.result.confidence,
      riskPercentage: a.result.riskPercentage,
      riskLevel: a.result.riskLevel,
      date: a.createdAt,
    }));

    const reportNames = reports.map((r) => r.fileName);

    const response = await axios.post(`${AI_URL}/generate-brief`, {
      chats: chatSummary,
      analyses: analysisSummary,
      report_names: reportNames,
    }, { timeout: 60000 });

    const briefText = response.data.brief;

    const brief = await MedicalBrief.create({
      userId,
      summaryText: briefText,
      dataUsed: {
        chatCount: chats.length,
        analysisCount: analyses.length,
        reportCount: reports.length,
      },
    });

    res.json({ brief });
  } catch (error) {
    if (error.response) {
      return res.status(502).json({
        message: 'AI server error while generating brief.',
        details: error.response.data,
      });
    }
    next(error);
  }
};

const getBriefs = async (req, res, next) => {
  try {
    const briefs = await MedicalBrief.find({ userId: req.user._id })
      .sort({ generatedAt: -1 })
      .lean();

    res.json({ briefs });
  } catch (error) {
    next(error);
  }
};

const getBrief = async (req, res, next) => {
  try {
    const brief = await MedicalBrief.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!brief) {
      return res.status(404).json({ message: 'Brief not found.' });
    }

    res.json({ brief });
  } catch (error) {
    next(error);
  }
};

const getDataSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const chatCount = await Chat.countDocuments({ userId });
    const analysisCount = await Analysis.countDocuments({ userId });
    const reportCount = await UploadedReport.countDocuments({ userId });

    res.json({ chatCount, analysisCount, reportCount });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateBrief,
  getBriefs,
  getBrief,
  getDataSummary,
};
