const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (for now, typically Admin only for a real school system)
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email and password' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('Registration Error:', err);
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login Error:', err);
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error('GetMe Error:', err);
    next(err);
  }
};

// @desc    Get OAuth provider authorization URL
// @route   GET /api/auth/oauth/:provider
// @access  Public
exports.getOAuthUrl = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const redirectUri = req.query.redirectUri || process.env.OAUTH_REDIRECT_URI || `http://localhost:5173/auth/callback/${provider}`;

    const providers = {
      google: {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        clientId: process.env.GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
      },
      microsoft: {
        authUrl: `https://login.microsoftonline.com/${process.env.MS_TENANT_ID || 'common'}/oauth2/v2.0/authorize`,
        clientId: process.env.MICROSOFT_CLIENT_ID,
        scope: 'openid email profile',
      },
      apple: {
        authUrl: 'https://appleid.apple.com/auth/authorize',
        clientId: process.env.APPLE_CLIENT_ID,
        scope: 'name email',
      },
    };

    const selected = providers[provider];
    if (!selected) {
      return res.status(400).json({ success: false, error: 'Unsupported provider' });
    }

    if (!selected.clientId) {
      return res.status(400).json({
        success: false,
        error: `${provider} OAuth is not configured on server`,
      });
    }

    const state = `${provider}-${Date.now()}`;
    const params = new URLSearchParams({
      client_id: selected.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: selected.scope,
      state,
    });

    res.status(200).json({
      success: true,
      data: {
        provider,
        url: `${selected.authUrl}?${params.toString()}`,
      },
    });
  } catch (err) {
    next(err);
  }
};

const socialConfig = (provider) => {
  if (provider === 'google') {
    return {
      tokenUrl: 'https://oauth2.googleapis.com/token',
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    };
  }
  if (provider === 'microsoft') {
    const tenant = process.env.MS_TENANT_ID || 'common';
    return {
      tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    };
  }
  return null;
};

const createAppleClientSecret = () => {
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const clientId = process.env.APPLE_CLIENT_ID;
  const privateKey = (process.env.APPLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!teamId || !keyId || !clientId || !privateKey) {
    return null;
  }

  return jwt.sign(
    {},
    privateKey,
    {
      algorithm: 'ES256',
      expiresIn: '180d',
      issuer: teamId,
      audience: 'https://appleid.apple.com',
      subject: clientId,
      keyid: keyId,
    }
  );
};

// @desc    OAuth callback exchange and login
// @route   POST /api/auth/oauth/:provider/callback
// @access  Public
exports.oauthCallback = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const { code, redirectUri } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Missing OAuth code' });
    }

    const config = socialConfig(provider);
    if (provider !== 'apple' && (!config?.clientId || !config?.clientSecret)) {
      return res.status(400).json({ success: false, error: `${provider} OAuth server config missing` });
    }

    let tokenResp;
    if (provider === 'apple') {
      const clientSecret = createAppleClientSecret();
      const clientId = process.env.APPLE_CLIENT_ID;
      if (!clientSecret || !clientId) {
        return res.status(400).json({ success: false, error: 'Apple OAuth server config missing' });
      }
      tokenResp = await fetch('https://appleid.apple.com/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri || process.env.OAUTH_REDIRECT_URI || `http://localhost:5173/auth/callback/${provider}`,
          grant_type: 'authorization_code',
        }),
      });
    } else {
      tokenResp = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: redirectUri || process.env.OAUTH_REDIRECT_URI || `http://localhost:5173/auth/callback/${provider}`,
        grant_type: 'authorization_code',
      }),
    });
    }

    const tokenData = await tokenResp.json();
    if (!tokenResp.ok || !tokenData.access_token) {
      return res.status(400).json({ success: false, error: 'OAuth token exchange failed' });
    }

    let profile;
    if (provider === 'apple') {
      const decoded = jwt.decode(tokenData.id_token);
      profile = {
        email: decoded?.email,
        name: decoded?.email ? decoded.email.split('@')[0] : 'Apple User',
      };
    } else {
      const profileResp = await fetch(config.userInfoUrl, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      profile = await profileResp.json();
      if (!profileResp.ok) {
        return res.status(400).json({ success: false, error: 'Failed to fetch OAuth profile' });
      }
    }

    const email = profile.email || profile.mail || profile.userPrincipalName;
    const name = profile.name || profile.displayName || 'Social User';
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email not available from provider' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = crypto.randomBytes(24).toString('hex');
      user = await User.create({
        name,
        email,
        password: randomPassword,
        role: 'Student',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};
