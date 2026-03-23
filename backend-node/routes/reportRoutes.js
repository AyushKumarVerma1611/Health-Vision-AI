const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  uploadReport,
  getUserReports,
  deleteReport,
} = require('../controllers/reportController');

router.use(authMiddleware);

router.post('/upload', upload.single('file'), uploadReport);
router.get('/', getUserReports);
router.delete('/:id', deleteReport);

module.exports = router;
