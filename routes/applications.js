const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// @route   POST api/applications
// @desc    Submit a job application
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        console.log('Application submission attempt:', {
            user: req.user.id,
            job: req.body.jobId
        });

        // Check if user is external or internal
        if (req.user.userType === 'hr') {
            return res.status(403).json({ msg: 'HR users cannot apply for jobs' });
        }

        // Check if job exists
        const job = await Job.findById(req.body.jobId);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Check if user has already applied
        const existingApplication = await Application.findOne({
            user: req.user.id,
            job: req.body.jobId
        });

        if (existingApplication) {
            return res.status(400).json({ msg: 'You have already applied for this job' });
        }

        // Create new application
        const newApplication = new Application({
            user: req.user.id,
            job: req.body.jobId
        });

        const application = await newApplication.save();
        console.log('Application submitted successfully:', application);

        res.json(application);
    } catch (err) {
        console.error('Error submitting application:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET api/applications
// @desc    Get user's applications or all applications for HR
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        let applications;
        
        if (req.user.userType === 'hr') {
            // HR users can see all applications
            applications = await Application.find()
                .populate('user', ['firstName', 'lastName', 'email'])
                .populate('job', ['title', 'department']);
        } else {
            // Regular users can only see their own applications
            applications = await Application.find({ user: req.user.id })
                .populate('job', ['title', 'department']);
        }

        res.json(applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
