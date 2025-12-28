const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.isAuthenticatedUser = async (req, res, next) => {
    const { token } = req.cookies || {};
    // Check header Authorization: Bearer <token>

    let tokenToVerify = token;

    if (!tokenToVerify && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        tokenToVerify = req.headers.authorization.split(' ')[1];
    }

    if (!tokenToVerify) {
        return res.status(401).json({ message: 'Login first to access this resource.' });
    }

    try {
        const decoded = jwt.verify(tokenToVerify, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'User not found. Please login again.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role (${req.user.role}) is not allowed to access this resource`
            });
        }
        next();
    };
};
