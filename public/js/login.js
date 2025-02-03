document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        console.log('Attempting login with:', { email });

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Server response:', errorData);
            throw new Error(`Login failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('Login successful:', data);

        // Store the token and user type
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', data.user.userType);

        // Redirect based on user type
        if (data.user.userType === 'hr') {
            window.location.href = '/dashboard.html';
        } else {
            window.location.href = '/dashboard.html';
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login error: ' + error.message);
    }
}); 