// Main Application Logic

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme and auth
    ThemeManager.init();
    Auth.init();

    // After a short delay, decide how the home page should look.
    setTimeout(() => {
        const isLoggedIn = Auth.isAuthenticated();
        const isTodoosPage = window.location.pathname.endsWith('todoos.html');

        const notesSection = document.getElementById('notes-section');
        const fabContainer = document.getElementById('fab-container');
        const primaryAuthBtn = document.getElementById('primary-auth-btn');
        const todoosEntry = document.getElementById('todoos-entry-section');

        if (isTodoosPage) {
            // Todoos page: require login, then show full notes experience.
            if (!isLoggedIn) {
                window.location.href = 'auth.html';
                return;
            }

            Notes.init();
            Notes.loadNotes();

            notesSection?.classList.remove('hidden');
            fabContainer?.classList.remove('hidden');
        } else {
            // Marketing / home page.
            PageManager.showPage('home-page');

            // Notes should not be visible on the home page anymore.
            notesSection?.classList.add('hidden');
            fabContainer?.classList.add('hidden');

            if (isLoggedIn) {
                todoosEntry?.classList.remove('hidden');
                if (primaryAuthBtn) {
                    primaryAuthBtn.textContent = 'Go to your todoos';
                }
            } else {
                todoosEntry?.classList.add('hidden');
                if (primaryAuthBtn) {
                    primaryAuthBtn.textContent = 'Login / Sign up';
                }
            }
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
    
    // Todoos page search (if present)
    setupTodoSearchEvents();
    
    // General Events
    setupGeneralEvents();
}

function setupAuthEvents() {
    // Auth interactions now live on auth.html in auth-page.js.
    // This is kept for compatibility but intentionally left empty.
}

function setupHomeEvents() {
    // Settings drawer toggle - triggered by app icon
    document.querySelectorAll('.settings-toggle').forEach(icon => {
        icon.addEventListener('click', () => {
            const settingsPanel = document.getElementById('settings-drawer');
            settingsPanel.classList.toggle('active');
        });
    });

    // Primary auth buttons (header + hero)
    function handleAuthCta() {
        if (Auth.isAuthenticated()) {
            window.location.href = 'todoos.html';
        } else {
            window.location.href = 'auth.html';
        }
    }

    document.getElementById('primary-auth-btn')?.addEventListener('click', handleAuthCta);
    document.getElementById('hero-cta-btn')?.addEventListener('click', handleAuthCta);

    // Navbar navigation
    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.nav;

            // Update active state for all nav buttons
            document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (target === 'home') {
                document.getElementById('home-hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (target === 'todoos') {
                if (Auth.isAuthenticated()) {
                    window.location.href = 'todoos.html';
                } else {
                    window.location.href = 'auth.html';
                }
            } else if (target === 'developer') {
                window.location.href = 'dev.html';
            } else if (target === 'suggestions') {
                document.getElementById('suggestions-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Add note FAB
    document.getElementById('add-fab')?.addEventListener('click', () => {
        Notes.currentNoteId = null;
        Notes.openNoteModal();
    });

    // Creative fields FAB
    document.getElementById('creative-fab')?.addEventListener('click', () => {
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

    // Developer page
    document.getElementById('developer-page-btn')?.addEventListener('click', () => {
        window.location.href = 'dev.html';
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

function setupTodoSearchEvents() {
    const searchInput = document.getElementById('todo-search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (!query) {
            Notes.renderNotes();
        } else {
            Notes.searchNotes(query);
        }
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
