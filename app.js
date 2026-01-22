// Main Application Logic

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    ThemeManager.init();
    Auth.init();

    // Wait for Firebase to be ready
    setTimeout(() => {
        if (Auth.isAuthenticated()) {
            Notes.init();
            Notes.loadNotes();
            PageManager.showPage('home-page');
        }
    }, 500);

    setupEventListeners();
});

function setupEventListeners() {
    // Auth Page Events
    setupAuthEvents();
    
    // Home Page Events
    setupHomeEvents();
    
    // Note Modal Events
    setupNoteModalEvents();
    
    // Settings Events
    setupSettingsEvents();
    
    // Creative Fields Events
    setupCreativeEvents();
    
    // Search Events
    setupSearchEvents();
    
    // General Events
    setupGeneralEvents();
}

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
            Notes.init();
            Notes.loadNotes();
            PageManager.showPage('home-page');
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
            Notes.init();
            Notes.loadNotes();
            PageManager.showPage('home-page');
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
}

function setupHomeEvents() {
    // Menu toggle
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('settings-drawer').classList.add('active');
    });

    // Add note FAB
    document.getElementById('add-fab').addEventListener('click', () => {
        Notes.currentNoteId = null;
        Notes.openNoteModal();
    });

    // Creative fields FAB
    document.getElementById('creative-fab').addEventListener('click', () => {
        PageManager.showPage('creative-fields-page');
    });
}

function setupNoteModalEvents() {
    // Close modal
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                PageManager.hideModal(modal.id);
            }
        });
    });

    // Favorite toggle in modal
    document.getElementById('note-favorite-btn').addEventListener('click', () => {
        const btn = document.getElementById('note-favorite-btn');
        btn.classList.toggle('favorited');
        btn.textContent = btn.classList.contains('favorited') ? '❤️' : '♡';
    });

    // Add checklist item
    document.getElementById('add-checklist-btn').addEventListener('click', () => {
        const input = document.getElementById('checklist-item-input');
        const text = input.value.trim();
        if (text) {
            Notes.addChecklistItemToModal(text);
            input.value = '';
        }
    });

    document.getElementById('checklist-item-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('add-checklist-btn').click();
        }
    });

    // Save note
    document.getElementById('save-note-btn').addEventListener('click', () => {
        Notes.saveNote();
    });
}

function setupSettingsEvents() {
    // Close drawer
    document.getElementById('close-drawer').addEventListener('click', () => {
        document.getElementById('settings-drawer').classList.remove('active');
    });

    document.getElementById('drawer-overlay').addEventListener('click', () => {
        document.getElementById('settings-drawer').classList.remove('active');
    });

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('change', () => {
        ThemeManager.toggleTheme();
    });

    // Glass mode toggle
    document.getElementById('glass-toggle').addEventListener('change', () => {
        ThemeManager.toggleGlassMode();
    });

    // Grid view toggle
    document.getElementById('grid-toggle').addEventListener('change', () => {
        ThemeManager.toggleGridView();
    });

    // Color options
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            if (option.classList.contains('custom-color')) {
                const colorInput = document.getElementById('color-picker-input');
                colorInput.click();
            } else {
                const color = option.dataset.color;
                const index = Array.from(option.parentElement.children).indexOf(option);
                ThemeManager.changePredefinedColor(index);
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            }
        });
    });

    // Custom color picker
    document.getElementById('color-picker-input').addEventListener('change', (e) => {
        const color = e.target.value;
        ThemeManager.changeThemeColor(color);
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
        document.querySelector('.custom-color').classList.add('active');
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            Notes.cleanup();
            Auth.logout();
        }
    });
}

function setupCreativeEvents() {
    // Back button
    document.querySelector('[data-back="home"]')?.addEventListener('click', () => {
        PageManager.showPage('home-page');
    });

    // Save creative field
    document.getElementById('creative-save-btn').addEventListener('click', () => {
        const title = document.getElementById('creative-title').value.trim();
        const content = document.getElementById('creative-content').value.trim();
        
        if (!title || !content) {
            Toast.error('Title and content are required');
            return;
        }

        // Show creative page
        PageManager.showPage('creative-page');
        document.getElementById('creative-card-title').textContent = title;
        document.getElementById('creative-card-content').textContent = content;
    });

    // Save card as image (simplified - just download as text for now)
    document.getElementById('save-card-btn').addEventListener('click', () => {
        // In a real implementation, you would use html2canvas or similar
        // For now, we'll just show a message
        Toast.success('Creative card feature - Use browser screenshot or print to save');
    });
}

function setupSearchEvents() {
    // Search toggle
    document.getElementById('search-toggle').addEventListener('click', () => {
        const searchBar = document.getElementById('search-bar');
        const searchResults = document.getElementById('search-results');
        searchBar.classList.remove('hidden');
        searchResults.classList.remove('hidden');
        document.getElementById('search-input').focus();
    });

    // Close search
    document.getElementById('close-search').addEventListener('click', () => {
        const searchBar = document.getElementById('search-bar');
        const searchResults = document.getElementById('search-results');
        searchBar.classList.add('hidden');
        searchResults.classList.add('hidden');
        document.getElementById('search-input').value = '';
        Notes.renderNotes();
    });

    // Search input
    let searchTimeout;
    document.getElementById('search-input').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            Notes.searchNotes(e.target.value);
        }, 300);
    });
}

function setupGeneralEvents() {
    // Back buttons
    document.querySelectorAll('.back-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.back;
            if (target) {
                PageManager.showPage(`${target}-page`);
            } else {
                window.history.back();
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

    // Escape key to close modals/drawers
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            PageManager.hideAllModals();
            document.getElementById('settings-drawer').classList.remove('active');
        }
    });
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Auth.isAuthenticated()) {
        // Reload notes when page becomes visible
        Notes.loadNotes();
    }
});
