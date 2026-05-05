const express = require('express');
const { register, login, getMe, getOAuthUrl, oauthCallback } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { requireFields, validateRole } = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  requireFields(['name', 'email', 'password']),
  validateRole(['Admin', 'Teacher', 'Student', 'Parent', 'Principal']),
  register
);
router.post('/login', requireFields(['email', 'password']), login);
router.get('/me', protect, getMe);
router.get('/oauth/:provider', getOAuthUrl);
router.post('/oauth/:provider/callback', oauthCallback);

module.exports = router;
