const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const Analysis = require('../models/Analysis');
const Chat = require('../models/Chat');

const AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:8000';

router.use(authMiddleware);

// POST /api/ai/ecg - Forward ECG image to Python AI
router.post('/ecg', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(`${AI_URL}/predict/ecg`, formData, {
      headers: formData.getHeaders(),
      timeout: 60000,
    });

    const result = response.data;

    const analysis = await Analysis.create({
      userId: req.user._id,
      type: 'ecg',
      result: {
        prediction: result.prediction,
        confidence: result.confidence,
        details: {
          description: result.description,
          recommendation: result.recommendation,
        },
      },
    });

    res.json({ ...result, analysisId: analysis._id });
  } catch (error) {
    if (error.response) {
      return res.status(502).json({
        message: 'AI server error.',
        details: error.response.data,
      });
    }
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        message: 'AI server is not available. Please ensure the Python AI server is running on port 8000.',
      });
    }
    next(error);
  }
});

// POST /api/ai/xray - Forward X-Ray image to Python AI
router.post('/xray', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(`${AI_URL}/predict/xray`, formData, {
      headers: formData.getHeaders(),
      timeout: 60000,
    });

    const result = response.data;

    const analysis = await Analysis.create({
      userId: req.user._id,
      type: 'xray',
      result: {
        prediction: result.prediction,
        confidence: result.confidence,
        details: {
          description: result.description,
          highlighted_region: result.highlighted_region,
        },
        heatmapUrl: result.heatmap_base64 ? 'base64' : '',
      },
    });

    res.json({ ...result, analysisId: analysis._id });
  } catch (error) {
    if (error.response) {
      return res.status(502).json({ message: 'AI server error.', details: error.response.data });
    }
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'AI server is not available.' });
    }
    next(error);
  }
});

// POST /api/ai/mri - Forward MRI image to Python AI
router.post('/mri', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(`${AI_URL}/predict/mri`, formData, {
      headers: formData.getHeaders(),
      timeout: 60000,
    });

    const result = response.data;

    const analysis = await Analysis.create({
      userId: req.user._id,
      type: 'mri',
      result: {
        prediction: result.prediction,
        confidence: result.confidence,
        details: {
          description: result.description,
        },
        heatmapUrl: result.heatmap_base64 ? 'base64' : '',
      },
    });

    res.json({ ...result, analysisId: analysis._id });
  } catch (error) {
    if (error.response) {
      return res.status(502).json({ message: 'AI server error.', details: error.response.data });
    }
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'AI server is not available.' });
    }
    next(error);
  }
});

// POST /api/ai/document - Forward document to Python AI
const fs = require('fs');
const path = require('path');
const UploadedReport = require('../models/UploadedReport');

router.post('/document', upload.single('file'), async (req, res, next) => {
  try {
    let fileBuffer, originalname, mimetype;

    if (req.body.reportId) {
      const report = await UploadedReport.findOne({ _id: req.body.reportId, userId: req.user._id });
      if (!report) return res.status(404).json({ message: 'Report not found' });
      
      const filePath = path.join(__dirname, '../../uploads/reports', report.cloudinaryPublicId);
      
      if (fs.existsSync(filePath)) {
        fileBuffer = fs.readFileSync(filePath);
      } else if (report.fileUrl && report.fileUrl.startsWith('http')) {
        // Fallback to fetching from remote URL (legacy Cloudinary support)
        try {
          const remoteFile = await axios.get(report.fileUrl, { responseType: 'arraybuffer' });
          fileBuffer = Buffer.from(remoteFile.data);
        } catch (downloadErr) {
          console.error("Failed to fetch legacy remote file:", downloadErr.message);
          return res.status(404).json({ message: 'Legacy file could not be downloaded from remote server' });
        }
      } else {
        return res.status(404).json({ message: 'File not found on disk or remote server' });
      }
      
      originalname = report.fileName;
      mimetype = report.fileType;
    } else if (req.file) {
      fileBuffer = req.file.buffer;
      originalname = req.file.originalname;
      mimetype = req.file.mimetype;
    } else {
      return res.status(400).json({ message: 'No file or reportId provided.' });
    }

    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: originalname,
      contentType: mimetype,
    });

    const response = await axios.post(`${AI_URL}/predict/document`, formData, {
      headers: formData.getHeaders(),
      timeout: 120000, // wait up to 2 mins for heavy PDFs
    });

    const result = response.data;

    const analysis = await Analysis.create({
      userId: req.user._id,
      type: 'document',
      result: {
        prediction: result.prediction,
        confidence: result.confidence,
        details: {
          description: result.description,
          recommendation: result.recommendations.join('\n') || '',
          raw_recommendations: result.recommendations, // store array for PDF generation
        },
      },
    });

    // Automatically upgrade legacy reports by saving the newly generated analysis back to the report doc
    if (req.body.reportId) {
      await UploadedReport.findByIdAndUpdate(req.body.reportId, {
        aiAnalysis: {
          prediction: result.prediction,
          confidence: result.confidence,
          description: result.description,
          recommendations: result.recommendations || []
        }
      });
    }

    res.json({ ...result, analysisId: analysis._id });
  } catch (error) {
    if (error.response) {
      const detail = error.response.data?.detail || '';
      const isQuota = typeof detail === 'string' && (detail.includes('Quota Exceeded') || detail.includes('quota') || detail.includes('429'));
      const status = isQuota ? 429 : 502;
      const message = isQuota ? 'Google API Quota Exceeded. Please wait a minute before trying again.' : (typeof detail === 'string' ? detail : 'AI server error.');
      return res.status(status).json({ message, details: error.response.data });
    }
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'AI server is not available.' });
    }
    next(error);
  }
});

// POST /api/ai/heart - Forward heart data to Python AI
router.post('/heart', async (req, res, next) => {
  try {
    const response = await axios.post(`${AI_URL}/predict/heart`, req.body, {
      timeout: 30000,
    });

    const result = response.data;

    const analysis = await Analysis.create({
      userId: req.user._id,
      type: 'heart',
      inputData: req.body,
      result: {
        prediction: result.risk_level,
        confidence: result.confidence || 0,
        riskPercentage: result.risk_percentage,
        riskLevel: result.risk_level,
        recommendations: result.recommendations || [],
      },
    });

    res.json({ ...result, analysisId: analysis._id });
  } catch (error) {
    if (error.response) {
      return res.status(502).json({ message: 'AI server error.', details: error.response.data });
    }
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'AI server is not available.' });
    }
    next(error);
  }
});

// POST /api/ai/diabetes - Forward diabetes data to Python AI
router.post('/diabetes', async (req, res, next) => {
  try {
    const response = await axios.post(`${AI_URL}/predict/diabetes`, req.body, {
      timeout: 30000,
    });

    const result = response.data;

    const analysis = await Analysis.create({
      userId: req.user._id,
      type: 'diabetes',
      inputData: req.body,
      result: {
        prediction: result.risk_level,
        confidence: result.confidence || 0,
        riskPercentage: result.risk_percentage,
        riskLevel: result.risk_level,
        recommendations: result.recommendations || [],
      },
    });

    res.json({ ...result, analysisId: analysis._id });
  } catch (error) {
    if (error.response) {
      return res.status(502).json({ message: 'AI server error.', details: error.response.data });
    }
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'AI server is not available.' });
    }
    next(error);
  }
});

// POST /api/ai/chat - Forward chat message to Python chatbot
router.post('/chat', async (req, res, next) => {
  try {
    const { message, sessionId, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const response = await axios.post(`${AI_URL}/chat`, {
      message,
      history: history || [],
    }, { timeout: 30000 });

    const aiResponse = response.data.response;

    if (sessionId) {
      let chat = await Chat.findOne({ sessionId, userId: req.user._id });
      if (chat) {
        chat.messages.push(
          { role: 'user', content: message, timestamp: new Date() },
          { role: 'assistant', content: aiResponse, timestamp: new Date() }
        );
        if (chat.messages.length === 2 && chat.title === 'New Conversation') {
          chat.title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
        }
        await chat.save();
      } else {
        chat = await Chat.create({
          userId: req.user._id,
          sessionId,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          messages: [
            { role: 'user', content: message, timestamp: new Date() },
            { role: 'assistant', content: aiResponse, timestamp: new Date() },
          ],
        });
      }
    }

    res.json({ response: aiResponse });
  } catch (error) {
    if (error.response) {
      return res.status(502).json({ message: 'AI server error.', details: error.response.data });
    }
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'AI server is not available.' });
    }
    next(error);
  }
});

// POST /api/ai/report - Generate PDF report
router.post('/report', async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      patient_name: req.user?.name || 'Patient',
    };
    
    const response = await axios.post(`${AI_URL}/generate-pdf`, payload, {
      timeout: 30000,
    });

    res.json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(502).json({ message: 'AI server error.', details: error.response.data });
    }
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'AI server is not available.' });
    }
    next(error);
  }
});

module.exports = router;
