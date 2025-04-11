document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }
    
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Simple validation
        if (!email || !password) {
            loginError.textContent = 'Please enter both email and password';
            loginError.classList.remove('d-none');
            return;
        }
        
        // Check credentials (in a real app, this would be a server request)
        if (email === 'admin@example.com' && password === 'admin123') {
            // Set login status in localStorage
            localStorage.setItem('adminLoggedIn', 'true');
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Show error message
            loginError.textContent = 'Invalid credentials. Try admin@example.com / admin123';
            loginError.classList.remove('d-none');
        }
    });
});