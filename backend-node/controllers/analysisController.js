const Analysis = require('../models/Analysis');

const saveAnalysis = async (req, res, next) => {
  try {
    const { type, inputData, result, scanImageUrl, reportPdfUrl } = req.body;

    if (!type) {
      return res.status(400).json({ message: 'Analysis type is required.' });
    }

    const analysis = await Analysis.create({
      userId: req.user._id,
      type,
      inputData: inputData || {},
      result: result || {},
      scanImageUrl: scanImageUrl || '',
      reportPdfUrl: reportPdfUrl || '',
    });

    res.status(201).json({ analysis });
  } catch (error) {
    next(error);
  }
};

const getUserAnalyses = async (req, res, next) => {
  try {
    const { type, limit = 50, page = 1 } = req.query;
    const query = { userId: req.user._id };
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const analyses = await Analysis.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Analysis.countDocuments(query);

    res.json({ analyses, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

const getAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found.' });
    }

    res.json({ analysis });
  } catch (error) {
    next(error);
  }
};

const deleteAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found.' });
    }

    res.json({ message: 'Analysis deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

const getAnalysisByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const analyses = await Analysis.find({ userId: req.user._id, type })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ analyses });
  } catch (error) {
    next(error);
  }
};

const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const totalAnalyses = await Analysis.countDocuments({ userId });

    const latestECG = await Analysis.findOne({ userId, type: 'ecg' })
      .sort({ createdAt: -1 })
      .lean();

    const latestHeart = await Analysis.findOne({ userId, type: 'heart' })
      .sort({ createdAt: -1 })
      .lean();

    const latestDiabetes = await Analysis.findOne({ userId, type: 'diabetes' })
      .sort({ createdAt: -1 })
      .lean();

    const recentAnalyses = await Analysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const heartTrend = await Analysis.find({ userId, type: 'heart' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('result.riskPercentage createdAt')
      .lean();

    const diabetesTrend = await Analysis.find({ userId, type: 'diabetes' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('result.riskPercentage createdAt')
      .lean();

    res.json({
      totalAnalyses,
      latestECG: latestECG ? {
        prediction: latestECG.result.prediction,
        confidence: latestECG.result.confidence,
        date: latestECG.createdAt,
      } : null,
      latestHeart: latestHeart ? {
        riskPercentage: latestHeart.result.riskPercentage,
        riskLevel: latestHeart.result.riskLevel,
        date: latestHeart.createdAt,
      } : null,
      latestDiabetes: latestDiabetes ? {
        riskPercentage: latestDiabetes.result.riskPercentage,
        riskLevel: latestDiabetes.result.riskLevel,
        date: latestDiabetes.createdAt,
      } : null,
      recentAnalyses,
      heartTrend: heartTrend.reverse(),
      diabetesTrend: diabetesTrend.reverse(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveAnalysis,
  getUserAnalyses,
  getAnalysis,
  deleteAnalysis,
  getAnalysisByType,
  getDashboardSummary,
};
