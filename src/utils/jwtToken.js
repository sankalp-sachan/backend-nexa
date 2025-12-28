// Create and send token and save in the cookie.
const sendToken = (user, statusCode, res) => {
    // Create token
    // Using jsonwebtoken directly
    const jwt = require('jsonwebtoken');
    const signedToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });

    const options = {
        expires: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days hardcoded or parse env
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', signedToken, options).json({
        success: true,
        token: signedToken,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        }
    });
};

module.exports = sendToken;
