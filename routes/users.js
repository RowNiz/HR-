const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post('/', async (req, res) => {
    try {
        console.log('Received registration request:', req.body); // Debug log

        const { firstName, lastName, email, password, userType } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !userType) {
            return res.status(400).json({ 
                msg: 'Please provide all required fields',
                missing: { firstName: !firstName, lastName: !lastName, email: !email, password: !password, userType: !userType }
            });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user
        user = new User({
            firstName,
            lastName,
            email,
            password,
            userType
        });

        console.log('Creating new user:', user); // Debug log

        // Save user to database
        await user.save();
        console.log('User saved successfully'); // Debug log

        // Create JWT payload
        const payload = {
            user: {
                id: user.id,
                userType: user.userType
            }
        };

        // Sign token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) {
                    console.error('JWT Sign error:', err); // Debug log
                    throw err;
                }
                res.json({ 
                    token,
                    user: {
                        id: user.id,
                        userType: user.userType
                    }
                });
            }
        );
    } catch (err) {
        console.error('Server error:', err); // Debug log
        res.status(500).json({
            msg: 'Server error',
            error: err.message
        });
    }
});

module.exports = router;
