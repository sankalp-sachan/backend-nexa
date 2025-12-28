const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getUserProfile
} = require('../controllers/authController');
const { isAuthenticatedUser } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/verify', verifyEmail);
router.post('/login', loginUser);
router.post('/password/forgot', forgotPassword);
router.put('/password/reset', resetPassword);
router.get('/logout', logout);
router.get('/me', isAuthenticatedUser, getUserProfile);

module.exports = router;
