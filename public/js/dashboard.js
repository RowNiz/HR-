document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    console.log('User type:', userType); // Debug log

    // Update UI based on user type
    if (userType === 'hr') {
        // Change both the tab text and the title
        document.getElementById('applicationsTabText').textContent = 'All Applications';
        document.getElementById('applicationsTitle').textContent = 'All Applications';
        // Add HR actions
        document.getElementById('hrActions').innerHTML = `
            <button onclick="window.location.href='post-job.html'" class="btn btn-primary">Post New Job</button>
        `;
    }

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        window.location.href = 'index.html';
    });

    // Setup tab navigation
    document.getElementById('jobsTab').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('jobs');
    });

    document.getElementById('applicationsTab').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('applications');
    });

    // Initial load of jobs
    await loadJobs();
});

function showSection(section) {
    // Update active tab
    document.getElementById('jobsTab').classList.remove('active');
    document.getElementById('applicationsTab').classList.remove('active');
    document.getElementById(`${section}Tab`).classList.add('active');

    // Show/hide sections
    document.getElementById('jobsSection').style.display = section === 'jobs' ? 'block' : 'none';
    document.getElementById('applicationsSection').style.display = section === 'applications' ? 'block' : 'none';

    // Load content if needed
    if (section === 'applications') {
        loadApplications();
    } else {
        loadJobs();
    }
}

async function loadJobs() {
    try {
        const response = await fetch('/api/jobs');
        
        if (!response.ok) {
            throw new Error('Failed to fetch jobs');
        }

        const jobs = await response.json();
        displayJobs(jobs);
    } catch (error) {
        console.error('Error loading jobs:', error);
        document.getElementById('jobListings').innerHTML = '<p>Error loading jobs</p>';
    }
}

function displayJobs(jobs) {
    const jobListings = document.getElementById('jobListings');
    const userType = localStorage.getItem('userType');
    
    if (jobs.length === 0) {
        jobListings.innerHTML = '<p>No jobs available at the moment.</p>';
        return;
    }

    const jobsHTML = jobs.map(job => `
        <div class="job-card">
            <h3>${job.title}</h3>
            <p class="department">Department: ${job.department}</p>
            <p class="location">Location: ${job.location}</p>
            ${job.salary ? `<p class="salary">Salary: ${job.salary}</p>` : ''}
            <p class="description">${job.description}</p>
            <div class="requirements">
                <strong>Requirements:</strong>
                <ul>
                    ${Array.isArray(job.requirements) ? 
                        job.requirements.map(req => `<li>${req}</li>`).join('') :
                        `<li>${job.requirements}</li>`}
                </ul>
            </div>
            ${userType === 'hr' ? 
                `<div class="admin-actions">
                    <button onclick="editJob('${job._id}')" class="btn btn-secondary">Edit</button>
                    <button onclick="deleteJob('${job._id}')" class="btn btn-danger">Delete</button>
                </div>` :
                `<button onclick="applyForJob('${job._id}')" class="btn btn-primary">Apply Now</button>`
            }
        </div>
    `).join('');

    jobListings.innerHTML = jobsHTML;
}

async function loadApplications() {
    try {
        const response = await fetch('/api/applications', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch applications');
        }

        const applications = await response.json();
        displayApplications(applications);
    } catch (error) {
        console.error('Error loading applications:', error);
        document.getElementById('applicationsList').innerHTML = '<p>Error loading applications</p>';
    }
}

function displayApplications(applications) {
    const applicationsList = document.getElementById('applicationsList');
    
    if (applications.length === 0) {
        applicationsList.innerHTML = '<p>No applications found.</p>';
        return;
    }

    const applicationsHTML = applications.map(app => `
        <div class="application-card">
            <h3>${app.job.title}</h3>
            <p>Department: ${app.job.department}</p>
            <div class="application-status status-${app.status.toLowerCase()}">
                Status: ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}
            </div>
            <div class="application-date">
                Applied on: ${new Date(app.appliedDate).toLocaleDateString()}
            </div>
        </div>
    `).join('');

    applicationsList.innerHTML = applicationsHTML;
}

async function applyForJob(jobId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/applications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ jobId })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData);
        }

        const data = await response.json();
        alert('Application submitted successfully!');
    } catch (error) {
        console.error('Error applying for job:', error);
        alert('Failed to submit application: ' + error.message);
    }
}

async function deleteJob(jobId) {
    const token = localStorage.getItem('token');
    
    try {
        if (!confirm('Are you sure you want to delete this job?')) {
            return;
        }

        console.log('Attempting to delete job:', jobId); // Debug log

        const response = await fetch(`/api/jobs/${jobId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Delete response status:', response.status); // Debug log

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Delete error response:', errorText); // Debug log
            throw new Error(`Failed to delete job: ${response.status} - ${errorText}`);
        }

        alert('Job deleted successfully');
        // Refresh the job listings
        await loadJobs();
    } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job: ' + error.message);
    }
}

function editJob(jobId) {
    window.location.href = `/edit-job.html?id=${jobId}`;
}

async function loadDashboardContent() {
    const userType = localStorage.getItem('userType');
    const dashboardContent = document.getElementById('dashboardContent');
    
    try {
        const response = await fetch('/api/users/dashboard', {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Display different content based on user type
            switch (userType) {
                case 'hr':
                    displayHRDashboard(data);
                    break;
                case 'internal':
                case 'external':
                    displayCandidateDashboard(data);
                    break;
            }
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        dashboardContent.innerHTML = '<p>Error loading dashboard content</p>';
    }
}

function displayHRDashboard(data) {
    const dashboardContent = document.getElementById('dashboardContent');
    dashboardContent.innerHTML = `
        <div class="dashboard-stats">
            <div class="stat-card">
                <h3>Open Positions</h3>
                <p>${data.openPositions || 0}</p>
            </div>
            <div class="stat-card">
                <h3>Total Applications</h3>
                <p>${data.totalApplications || 0}</p>
            </div>
            <div class="stat-card">
                <h3>Pending Reviews</h3>
                <p>${data.pendingReviews || 0}</p>
            </div>
        </div>
    `;
}

function displayCandidateDashboard(data) {
    const dashboardContent = document.getElementById('dashboardContent');
    dashboardContent.innerHTML = `
        <div class="dashboard-stats">
            <div class="stat-card">
                <h3>My Applications</h3>
                <p>${data.applications || 0}</p>
            </div>
            <div class="stat-card">
                <h3>Available Jobs</h3>
                <p>${data.availableJobs || 0}</p>
            </div>
        </div>
    `;
} 