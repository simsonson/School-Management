const express = require('express');
const { protect } = require('../middleware/auth');
const { getMyNotifications, markRead } = require('../controllers/notificationController');

const router = express.Router();

router.use(protect);
router.get('/', getMyNotifications);
router.put('/:id/read', markRead);

module.exports = router;
