const express = require('express');
const { sendChatMessage, getSubjects } = require('../controllers/chatbotController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Student'));

router.post('/message', sendChatMessage);
router.get('/subjects', getSubjects);

module.exports = router;
