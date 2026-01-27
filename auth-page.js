// Auth Page Event Handlers

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme and auth
    ThemeManager.init();
    Auth.init();

    // If already logged in (based on local flag), send straight to home
    setTimeout(() => {
        if (Auth.isAuthenticated()) {
            window.location.href = 'index.html';
        }
    }, 500);

    setupAuthEvents();
});

function setupAuthEvents() {
    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tabName}-form`).classList.add('active');
        });
    });

    // Login
    document.getElementById('login-btn').addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            Toast.error('One or more fields are empty');
            return;
        }

        const success = await Auth.login(email, password);
        if (success) {
            // Redirect to home page after successful login
            window.location.href = 'index.html';
        }
    });

    // Signup
    document.getElementById('signup-btn').addEventListener('click', async () => {
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        if (!email || !password) {
            Toast.error('One or more fields are empty');
            return;
        }

        const success = await Auth.signup(email, password);
        if (success) {
            // Redirect to home page after successful signup
            window.location.href = 'index.html';
        }
    });

    // Forgot Password
    document.getElementById('forgot-password-btn').addEventListener('click', () => {
        PageManager.showModal('forgot-password-modal');
    });

    document.getElementById('reset-password-btn').addEventListener('click', async () => {
        const email = document.getElementById('forgot-email').value;
        if (!email) {
            Toast.error('Please enter your email');
            return;
        }
        await Auth.forgotPassword(email);
    });

    // Switch between login/signup
    document.querySelectorAll('[data-switch]').forEach(link => {
        link.addEventListener('click', () => {
            const targetTab = link.dataset.switch;
            document.querySelectorAll('.auth-tab').forEach(t => {
                if (t.dataset.tab === targetTab) {
                    t.click();
                }
            });
        });
    });

    // Password toggle
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.dataset.target;
            const input = document.getElementById(targetId);
            if (input.type === 'password') {
                input.type = 'text';
                toggle.textContent = '🙈';
            } else {
                input.type = 'password';
                toggle.textContent = '👁️';
            }
        });
    });

    // Close modal
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                PageManager.hideModal(modal.id);
            }
        });
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                PageManager.hideModal(modal.id);
            }
        });
    });

    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            PageManager.hideAllModals();
        }
    });
}
