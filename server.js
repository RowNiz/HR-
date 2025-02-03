const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        path: req.path,
        headers: req.headers
    });
    next();
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));

// Serve static files from the public directory
app.use(express.static('public'));

// Handle all other routes
app.get('*', (req, res) => {
    // Only send index.html for non-API routes
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.status(404).json({ msg: 'API endpoint not found' });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log('Available routes:');
    console.log('- POST /api/auth/login (login)');
    console.log('- POST /api/users (signup)');
    console.log('- GET /api/jobs (get all jobs)');
    console.log('- POST /api/jobs (create job)');
    console.log('- GET /api/applications (get applications)');
}); 