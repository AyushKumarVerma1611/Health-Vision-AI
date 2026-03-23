const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  generateBrief,
  getBriefs,
  getBrief,
  getDataSummary,
} = require('../controllers/briefController');

router.use(authMiddleware);

router.post('/generate', generateBrief);
router.get('/', getBriefs);
router.get('/data-summary', getDataSummary);
router.get('/:id', getBrief);

module.exports = router;
