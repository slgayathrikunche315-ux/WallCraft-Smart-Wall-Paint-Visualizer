const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();

// ================= SIGNUP =================

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                message: 'Please enter a valid email'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: 'Password must contain at least 8 characters'
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: 'Registration successful'
        });

    } catch (error) {
        console.error('Signup Error:', error);

        res.status(500).json({
            message: 'Signup failed'
        });
    }
});


// ================= LOGIN =================

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login Error:', error);

        res.status(500).json({
            message: 'Login failed'
        });
    }
});


// ================= FORGOT PASSWORD =================

router.post('/forgot-password', async (req, res) => {
    try {
        console.log('FORGOT PASSWORD API CALLED');

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(404).json({
                message: 'Email not registered'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetLink =
            `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // Send response immediately
        res.json({
            message: 'Your password reset request has been received. Email service is currently unavailable.'
        });

        // Try sending email in the background
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'WallCraft Password Reset',
            html: `
                <h2>WallCraft Password Reset</h2>
                <p>Click below to reset your password.</p>
                <a href="${resetLink}">Reset Password</a>
                <p>This link expires in 15 minutes.</p>
            `
        }).then(() => {
            console.log('Password reset email sent successfully');
        }).catch((error) => {
            console.error('Email sending failed:', error.message);
        });

    } catch (error) {
        console.error('Forgot Password Error:', error);

        if (!res.headersSent) {
            res.status(500).json({
                message: 'Something went wrong. Please try again.'
            });
        }
    }
});


// ================= RESET PASSWORD =================

router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({
                message: 'Password must contain at least 8 characters'
            });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired reset link'
            });
        }

        user.password = await bcrypt.hash(password, 12);

        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.json({
            message: 'Password reset successful. Please login.'
        });

    } catch (error) {
        console.error('Reset Password Error:', error);

        res.status(500).json({
            message: 'Password reset failed'
        });
    }
});


module.exports = router;