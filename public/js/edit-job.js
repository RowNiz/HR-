document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    // Check if user is logged in and is HR
    if (!token || userType !== 'hr') {
        window.location.href = '/dashboard.html';
        return;
    }

    // Get job ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id');

    console.log('Job ID from URL:', jobId); // Debug log

    if (!jobId) {
        alert('No job ID provided');
        window.location.href = '/dashboard.html';
        return;
    }

    // Load job details
    try {
        console.log('Fetching job details...'); // Debug log
        const response = await fetch(`/api/jobs/${jobId}`, {
            method: 'GET', // Explicitly specify method
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Response status:', response.status); // Debug log

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText); // Debug log
            throw new Error(`Failed to fetch job details: ${response.status} - ${errorText}`);
        }

        const job = await response.json();
        console.log('Received job details:', job); // Debug log
        
        // Populate form with job details
        document.getElementById('title').value = job.title || '';
        document.getElementById('department').value = job.department || '';
        document.getElementById('location').value = job.location || '';
        document.getElementById('salary').value = job.salary || '';
        document.getElementById('jobType').value = job.jobType || 'internal';
        document.getElementById('description').value = job.description || '';
        document.getElementById('requirements').value = Array.isArray(job.requirements) ? 
            job.requirements.join(', ') : (job.requirements || '');
    } catch (error) {
        console.error('Error loading job details:', error);
        alert('Error loading job details: ' + error.message);
        // Don't redirect on error, let user try again or manually go back
    }

    // Handle form submission
    document.getElementById('editJobForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedJob = {
            title: document.getElementById('title').value,
            department: document.getElementById('department').value,
            location: document.getElementById('location').value,
            salary: document.getElementById('salary').value,
            jobType: document.getElementById('jobType').value,
            description: document.getElementById('description').value,
            requirements: document.getElementById('requirements').value.split(',').map(req => req.trim())
        };

        try {
            const response = await fetch(`/api/jobs/${jobId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedJob)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update job: ${response.status} - ${errorText}`);
            }

            alert('Job updated successfully');
            window.location.href = '/dashboard.html';
        } catch (error) {
            console.error('Error updating job:', error);
            alert('Failed to update job: ' + error.message);
        }
    });

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        window.location.href = '/index.html';
    });
}); 