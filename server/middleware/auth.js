const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware: verifies the JWT sent in the Authorization header and attaches
// the corresponding user (minus password) to req.user for downstream handlers
const protect = async (req, res, next) => {
    let token = req.headers.authorization;
    // Expecting header format: "Bearer <token>"
    if (token && token.startsWith('Bearer')) {
        try {
            // Extract just the token part after "Bearer "
            token = token.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Fetch the user from the DB (excluding password field) using the decoded id
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            // Token valid and user found — proceed to the next middleware/route handler
            next();
        } catch (error) {
            // Token invalid, expired, or malformed
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        // No Authorization header or wrong format
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware: restricts a route to admin users only.
// Must run after `protect`, since it relies on req.user being set
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
