const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const sendToken = require('../utils/jwtToken');
const { getOTPTemplate } = require('../utils/emailTemplates');

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        let user = await User.findOne({ email });

        if (user) {
            if (!user.isVerified) {
                // If user exists but not verified, update OTP and resend
                user.otp = otp;
                user.otpExpires = otpExpires;
                await user.save();
            } else {
                return res.status(400).json({ message: 'User already exists' });
            }
        } else {
            user = await User.create({
                name,
                email,
                password,
                otp,
                otpExpires,
                isVerified: false
            });
        }


        const message = `Your OTP for NexusMart registration is ${otp}. It is valid for 10 minutes.`;
        const html = getOTPTemplate(
            'Verify Your Email',
            user.name,
            otp,
            `Welcome to NexusMart! Use the following OTP to verify your email address. This OTP is valid for 10 minutes.`,
            process.env.FRONTEND_URL
        );

        try {
            await sendEmail({
                email: user.email,
                subject: 'NexusMart Email Verification',
                message,
                html
            });

            res.status(200).json({
                success: true,
                message: `Email sent to ${user.email}`,
                userId: user._id // Send ID so client can use it for verification step
            });
        } catch (error) {
            console.error('Email send failed:', error.message);
            console.log('DEMO MODE - OTP:', otp);
            // Don't fail the request, just return success with a warning or just success for demo
            res.status(200).json({
                success: true,
                message: `Email could not be sent (Check Console for OTP). Demo Mode. OTP: ${otp}`,
                userId: user._id
            });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find user by email and check if OTP matches and is not expired
        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid OTP or OTP expired' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        sendToken(user, 200, res);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.correctPassword(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            // Option: Send new OTP here or force them to use verify endpoint
            return res.status(401).json({ message: 'Please verify your email first' });
        }

        sendToken(user, 200, res);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save({ validateBeforeSave: false });

        const message = `Your Password Reset OTP is ${otp}. It is valid for 10 minutes.`;
        const html = getOTPTemplate(
            'Reset Password',
            user.name,
            otp,
            `You requested to reset your password. Use the following OTP to continue. This OTP is valid for 10 minutes.`,
            process.env.FRONTEND_URL
        );

        try {
            await sendEmail({
                email: user.email,
                subject: 'NexusMart Password Recovery',
                message,
                html
            });

            res.status(200).json({
                success: true,
                message: `Email sent to ${user.email}`
            });
        } catch (error) {
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save({ validateBeforeSave: false });

            // DEMO MODE fallback
            console.log('DEMO MODE - Reset OTP:', otp);
            res.status(200).json({
                success: true,
                message: `Email could not be sent. Demo OTP: ${otp}`
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid OTP or has expired' });
        }

        user.password = password;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        sendToken(user, 200, res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user
    });
};
