document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in and is HR
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'hr') {
        window.location.href = '/dashboard.html';
        return;
    }

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        window.location.href = '/index.html';
    });
});

document.getElementById('postJobForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to post jobs');
        window.location.href = '/index.html';
        return;
    }

    const jobData = {
        title: document.getElementById('title').value,
        department: document.getElementById('department').value,
        location: document.getElementById('location').value,
        salary: document.getElementById('salary').value,
        jobType: document.getElementById('jobType').value,
        description: document.getElementById('description').value,
        requirements: document.getElementById('requirements').value.split(',').map(req => req.trim())
    };

    try {
        console.log('Sending job data:', jobData);
        console.log('Using token:', token);

        const response = await fetch('/api/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(jobData)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Server response:', errorData);
            throw new Error(`Failed to post job: ${response.status}`);
        }

        const data = await response.json();
        console.log('Job posted successfully:', data);
        
        alert('Job posted successfully!');
        window.location.href = '/dashboard.html';
    } catch (error) {
        console.error('Error posting job:', error);
        alert('Error posting job: ' + error.message);
    }
}); 