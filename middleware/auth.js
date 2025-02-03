const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
    console.log('Auth middleware - Headers:', req.headers); // Debug log

    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                 req.header('x-auth-token');

    console.log('Token extracted:', token); // Debug log

    // Check if no token
    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verify token
        console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'exists' : 'missing'); // Debug log
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user from payload
        req.user = decoded.user;
        console.log('Decoded token payload:', decoded); // Debug log
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
}; 