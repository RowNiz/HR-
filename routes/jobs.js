const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// @route   GET api/jobs
// @desc    Get all jobs
// @access  Public
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/jobs/:id
// @desc    Get job by ID
// @access  Private (HR only)
router.get('/:id', auth, async (req, res) => {
    try {
        console.log('Fetching job with ID:', req.params.id); // Debug log

        const job = await Job.findById(req.params.id);
        
        console.log('Found job:', job); // Debug log

        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Check if user is HR
        if (req.user.userType !== 'hr') {
            return res.status(403).json({ msg: 'Not authorized to view job details' });
        }

        res.json(job);
    } catch (err) {
        console.error('Error fetching job:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   POST api/jobs
// @desc    Create a job
// @access  Private (HR only)
router.post('/', auth, async (req, res) => {
    try {
        console.log('Authenticated user:', req.user);
        
        // Check if user is HR
        if (req.user.userType !== 'hr') {
            return res.status(403).json({ msg: 'Not authorized to post jobs' });
        }

        const { 
            title, 
            description, 
            requirements, 
            jobType, 
            department, 
            location, 
            salary 
        } = req.body;

        // Validate required fields
        if (!title || !description || !requirements) {
            return res.status(400).json({ msg: 'Please include all required fields' });
        }

        const newJob = new Job({
            title,
            description,
            requirements: Array.isArray(requirements) ? requirements : requirements.split(',').map(req => req.trim()),
            jobType,
            department,
            location,
            salary,
            postedBy: req.user.id
        });

        const job = await newJob.save();
        console.log('Job created:', job); // Debug log
        
        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/jobs/:id
// @desc    Update a job
// @access  Private (HR only)
router.put('/:id', auth, async (req, res) => {
    try {
        console.log('Update request for job:', req.params.id); // Debug log
        console.log('Update data:', req.body); // Debug log

        // Check if user is HR
        if (req.user.userType !== 'hr') {
            return res.status(403).json({ msg: 'Not authorized to edit jobs' });
        }

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        console.log('Job updated:', updatedJob); // Debug log
        res.json(updatedJob);
    } catch (err) {
        console.error('Error updating job:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   DELETE api/jobs/:id
// @desc    Delete a job
// @access  Private (HR only)
router.delete('/:id', auth, async (req, res) => {
    try {
        console.log('Delete request for job:', req.params.id); // Debug log

        // Check if user is HR
        if (req.user.userType !== 'hr') {
            return res.status(403).json({ msg: 'Not authorized to delete jobs' });
        }

        const job = await Job.findById(req.params.id);
        
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        await Job.findByIdAndDelete(req.params.id);
        console.log('Job deleted successfully'); // Debug log

        res.json({ msg: 'Job deleted successfully' });
    } catch (err) {
        console.error('Error deleting job:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

module.exports = router;
