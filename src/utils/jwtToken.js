// Create and send token and save in the cookie.
const sendToken = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken ? user.getSignedJwtToken() : null;
    // Wait, I didn't add the method to the schema yet. 
    // I should actually implement the signing here or add the method to the model.
    // Let's use jwt.sign directly here for clarity or check if I can modify the User model.
    // Easier to just use jwt here if I don't want to edit User.js again immediately.
    // Actually, standard practice is to put it in the model or here.
    // I'll put it here.

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
