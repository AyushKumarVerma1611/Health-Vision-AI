const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  saveAnalysis,
  getUserAnalyses,
  getAnalysis,
  deleteAnalysis,
  getAnalysisByType,
  getDashboardSummary,
} = require('../controllers/analysisController');

router.use(authMiddleware);

router.get('/dashboard', getDashboardSummary);
router.post('/', saveAnalysis);
router.get('/', getUserAnalyses);
router.get('/type/:type', getAnalysisByType);
router.get('/:id', getAnalysis);
router.delete('/:id', deleteAnalysis);

module.exports = router;
