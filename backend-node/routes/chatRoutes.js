const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createOrUpdateSession,
  getSessions,
  getSession,
  deleteSession,
} = require('../controllers/chatController');

router.use(authMiddleware);

router.post('/', createOrUpdateSession);
router.get('/', getSessions);
router.get('/:sessionId', getSession);
router.delete('/:sessionId', deleteSession);

module.exports = router;
