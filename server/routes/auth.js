const express = require('express');
const router = express.Router();
const { register, login, verifyOTP } = require('../controllers/authController');

// Auth routes — all public (no auth middleware), since users aren't logged in yet
// POST /api/auth/register - create a new account, triggers OTP email
router.post('/register', register);
// POST /api/auth/login - authenticate with email/password
router.post('/login', login);
// POST /api/auth/verify-otp - verify OTP for account activation or unverified-account login
router.post('/verify-otp', verifyOTP);

module.exports = router;
