// Main Application Logic

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme and auth
    ThemeManager.init();
    Auth.init();

    // After a short delay, decide where the user should be.
    setTimeout(() => {
        const isLoggedIn = Auth.isAuthenticated();

        // If not logged in, always send to dedicated auth page
        if (!isLoggedIn) {
            window.location.href = 'auth.html';
            return;
        }

        // Logged in: initialize notes and show home page
        Notes.init();
        Notes.loadNotes();
        PageManager.showPage('home-page');
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
    // Auth interactions now live on auth.html in auth-page.js.
    // This is kept for compatibility but intentionally left empty.
}

function setupHomeEvents() {
    // Menu toggle
    document.getElementById('menu-toggle').addEventListener('click', () => {
        const settingsPanel = document.getElementById('settings-drawer');
        settingsPanel.classList.toggle('active');
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
        PageManager.showPage('developer-page');
        document.getElementById('settings-drawer').classList.remove('active');
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
    const searchInput = document.getElementById('search-input');
    const searchClearBtn = document.getElementById('search-clear-btn');
    const searchResults = document.getElementById('search-results');

    // Show/hide clear button based on input value
    function updateClearButton() {
        if (searchInput.value.trim().length > 0) {
            searchClearBtn.style.display = 'flex';
        } else {
            searchClearBtn.style.display = 'none';
        }
    }

    // Clear search
    searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        updateClearButton();
        Notes.renderNotes();
        searchResults.classList.add('hidden');
    });

    // Search input
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        updateClearButton();
        clearTimeout(searchTimeout);
        
        const query = e.target.value.trim();
        if (query.length > 0) {
            searchResults.classList.remove('hidden');
            searchTimeout = setTimeout(() => {
                Notes.searchNotes(query);
            }, 300);
        } else {
            searchResults.classList.add('hidden');
            Notes.renderNotes();
        }
    });

    // Initialize clear button state
    updateClearButton();
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
