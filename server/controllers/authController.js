const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/email');

// Generates a random 6-digit numeric OTP as a string (100000–999999)
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Signs a JWT containing the user's id and role, valid for 30 days
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /register - creates a new user account and sends an OTP for verification
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Prevent duplicate accounts for the same email
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        // Hash the password before storing it
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'user', // Hardcoded to prevent frontend passing role
            isVerified: false
        });

        // Generate and email an OTP so the user can verify their account
        const otp = generateOTP();
        await OTP.create({ email, otp, action: 'account_verification' });
        await sendOTPEmail(email, otp, 'account_verification');

        // Account created but not yet usable until OTP is verified
        res.status(201).json({
            message: 'OTP sent to email. Please verify.',
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// POST /login - authenticates a user with email/password
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        // Use a generic "Invalid credentials" message for both missing user and wrong password,
        // to avoid revealing whether an email is registered
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // If the account isn't verified yet (and isn't an admin), block login,
        // generate a fresh OTP, and prompt the client to complete verification instead
        if (!user.isVerified && user.role !== 'admin') {
            const otp = generateOTP();
            // Remove any old unverified OTP before creating a new one
            await OTP.findOneAndDelete({ email: user.email, action: 'account_verification' });
            await OTP.create({ email: user.email, otp, action: 'account_verification' });
            await sendOTPEmail(user.email, otp, 'account_verification');
            return res.status(403).json({ message: 'Account not verified', needsVerification: true, email: user.email });
        }

        // Successful login: return user info + signed JWT
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// POST /verify-otp - verifies a submitted OTP and activates the account (used for both
// registration verification and the "account not verified" login flow)
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        // Look up a matching, non-expired OTP record for this email/action
        const validOTP = await OTP.findOne({ email, otp, action: 'account_verification' });

        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Mark the user as verified now that the OTP has been confirmed
        const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
        await OTP.deleteOne({ _id: validOTP._id }); // Delete OTP after usage

        // Log the user in immediately after successful verification
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
