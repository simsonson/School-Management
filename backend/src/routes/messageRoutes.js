const express = require('express');
const {
  getConversations,
  getMessages,
  sendMessage,
  getContacts,
} = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Parent', 'Teacher'));

router.get('/conversations', getConversations);
router.get('/contacts', getContacts);
router.post('/', sendMessage);
router.get('/:userId', getMessages);

module.exports = router;
