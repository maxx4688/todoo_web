// Utility Functions

// Theme Management
const ThemeManager = {
    init() {
        this.loadTheme();
        this.loadThemeColor();
        this.loadGlassMode();
        this.loadGridView();
    },

    loadTheme() {
        const isDark = localStorage.getItem('isDarkMode') === 'true';
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        const toggle = document.getElementById('theme-toggle');
        if (toggle) toggle.checked = isDark;
    },

    toggleTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('isDarkMode', newTheme === 'dark');
        const toggle = document.getElementById('theme-toggle');
        if (toggle) toggle.checked = newTheme === 'dark';
    },

    loadThemeColor() {
        const customColor = localStorage.getItem('customThemeColor');
        const colorIndex = localStorage.getItem('themeColor');
        
        if (customColor) {
            this.setThemeColor(customColor);
        } else if (colorIndex !== null) {
            const colors = ['#1A9DF7', '#D70040', '#FFAA33'];
            const color = colors[parseInt(colorIndex)] || colors[0];
            this.setThemeColor(color);
        } else {
            this.setThemeColor('#1A9DF7');
        }
    },

    setThemeColor(color) {
        document.documentElement.style.setProperty('--theme-color', color);
        // Update active color option
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.color === color || 
                (option.classList.contains('custom-color') && !option.dataset.color)) {
                option.classList.add('active');
            }
        });
    },

    changeThemeColor(color) {
        this.setThemeColor(color);
        localStorage.setItem('customThemeColor', color);
        localStorage.removeItem('themeColor');
    },

    changePredefinedColor(index) {
        const colors = ['#1A9DF7', '#D70040', '#FFAA33'];
        const color = colors[index];
        if (color) {
            this.setThemeColor(color);
            localStorage.setItem('themeColor', index.toString());
            localStorage.removeItem('customThemeColor');
        }
    },

    loadGlassMode() {
        const glassMode = localStorage.getItem('glassMode') === 'true';
        if (glassMode) {
            document.body.classList.add('glass-mode');
        }
        const toggle = document.getElementById('glass-toggle');
        if (toggle) toggle.checked = glassMode;
    },

    toggleGlassMode() {
        const isGlass = document.body.classList.contains('glass-mode');
        if (isGlass) {
            document.body.classList.remove('glass-mode');
            localStorage.setItem('glassMode', 'false');
        } else {
            document.body.classList.add('glass-mode');
            localStorage.setItem('glassMode', 'true');
        }
    },

    loadGridView() {
        const isGrid = localStorage.getItem('gridView') === 'true';
        const container = document.getElementById('notes-list');
        if (container) {
            if (isGrid) {
                container.classList.add('grid-view');
            } else {
                container.classList.remove('grid-view');
            }
        }
        const toggle = document.getElementById('grid-toggle');
        if (toggle) toggle.checked = isGrid;
    },

    toggleGridView() {
        const container = document.getElementById('notes-list');
        if (container) {
            const isGrid = container.classList.contains('grid-view');
            if (isGrid) {
                container.classList.remove('grid-view');
                localStorage.setItem('gridView', 'false');
            } else {
                container.classList.add('grid-view');
                localStorage.setItem('gridView', 'true');
            }
        }
    }
};

// URL Detection and Parsing
const URLUtils = {
    extractUrls(text) {
        const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
        return text.match(urlPattern) || [];
    },

    getTextWithoutUrls(text) {
        const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
        return text.replace(urlPattern, '').trim();
    },

    normalizeUrl(url) {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return 'https://' + url;
    },

    createUrlElement(url) {
        const a = document.createElement('a');
        a.href = this.normalizeUrl(url);
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'note-url';
        a.innerHTML = `
            <span>🔗</span>
            <span>${url.length > 20 ? url.substring(0, 20) + '...' : url}</span>
        `;
        return a;
    },

    createViewUrlElement(url) {
        const a = document.createElement('a');
        a.href = this.normalizeUrl(url);
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'view-note-url';
        a.innerHTML = `
            <span>🔗</span>
            <span>${url}</span>
            <span>↗</span>
        `;
        return a;
    }
};

// Date Formatting
const DateUtils = {
    formatTimestamp(timestamp) {
        if (!timestamp) return 'null';
        const date = timestamp.toDate();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${hours}:${minutes} on ${day} ${month} ${year}`;
    }
};

// Toast Notifications
const Toast = {
    show(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    },

    error(message) {
        this.show(message, 'error');
    },

    success(message) {
        this.show(message, 'success');
    }
};

// Loading Overlay
const Loading = {
    show() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.remove('hidden');
    },

    hide() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.add('hidden');
    }
};

// Page Navigation
const PageManager = {
    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        const page = document.getElementById(pageId);
        if (page) {
            page.classList.add('active');
        }
        
        // Hide/show FAB buttons and creative page based on active page
        const fabContainer = document.querySelector('.fab-container');
        const creativePage = document.getElementById('creative-page');
        
        // Hide creative page and FAB buttons on view-note-page and developer-page
        if (pageId === 'view-note-page' || pageId === 'developer-page') {
            if (fabContainer) fabContainer.style.display = 'none';
            if (creativePage) creativePage.style.display = 'none';
        }
        // Hide creative page on home page, show FAB buttons
        else if (pageId === 'home-page') {
            if (fabContainer) fabContainer.style.display = 'flex';
            if (creativePage) creativePage.style.display = 'none';
        }
        // Show creative page only when on creative-page itself
        else if (pageId === 'creative-page') {
            if (fabContainer) fabContainer.style.display = 'none';
            if (creativePage) creativePage.style.display = '';
        }
        // Default: show FAB buttons, hide creative page
        else {
            if (fabContainer) fabContainer.style.display = 'flex';
            if (creativePage) creativePage.style.display = 'none';
        }
    },

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
};

// Export utilities
window.ThemeManager = ThemeManager;
window.URLUtils = URLUtils;
window.DateUtils = DateUtils;
window.Toast = Toast;
window.Loading = Loading;
window.PageManager = PageManager;
