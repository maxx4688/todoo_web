// Main Application Logic

document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('js');

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

            const heroCta = document.getElementById('hero-cta-btn');
            const compactHeader = window.matchMedia('(max-width: 720px)').matches;

            if (isLoggedIn) {
                todoosEntry?.classList.remove('hidden');
                if (primaryAuthBtn) {
                    primaryAuthBtn.textContent = compactHeader ? 'Workspace' : 'Open workspace';
                }
                if (heroCta) {
                    heroCta.textContent = 'Open workspace';
                }
            } else {
                todoosEntry?.classList.add('hidden');
                if (primaryAuthBtn) {
                    primaryAuthBtn.textContent = compactHeader ? 'Log in' : 'Login / Sign up';
                }
                if (heroCta) {
                    heroCta.textContent = 'Start writing';
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
    const isLanding = document.body.classList.contains('landing');
    const isWorkspace = document.body.classList.contains('workspace');
    const isAppChrome = isLanding || isWorkspace;

    const setAuthButtonLabel = () => {
        const primaryAuthBtn = document.getElementById('primary-auth-btn');
        if (!primaryAuthBtn || !isLanding) return;
        const compactHeader = window.matchMedia('(max-width: 720px)').matches;
        const loggedIn = typeof Auth !== 'undefined' && Auth.isAuthenticated();
        if (loggedIn) {
            primaryAuthBtn.textContent = compactHeader ? 'Workspace' : 'Open workspace';
        } else {
            primaryAuthBtn.textContent = compactHeader ? 'Log in' : 'Login / Sign up';
        }
    };

    setAuthButtonLabel();
    if (isLanding) {
        window.addEventListener('resize', setAuthButtonLabel);
    }

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
    document.getElementById('close-cta-btn')?.addEventListener('click', handleAuthCta);

    const header = document.getElementById('app-header');
    const navToggle = document.getElementById('nav-toggle');
    const closeMobileNav = () => {
        header?.classList.remove('nav-open');
        navToggle?.setAttribute('aria-expanded', 'false');
        navToggle?.setAttribute('aria-label', 'Open menu');
    };

    navToggle?.addEventListener('click', () => {
        const isOpen = header?.classList.toggle('nav-open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    const setHeaderElevation = () => {
        if (!header || !isAppChrome) return;
        header.classList.toggle('is-elevated', window.scrollY > 16);
    };

    if (isAppChrome) {
        setHeaderElevation();
        window.addEventListener('scroll', setHeaderElevation, { passive: true });
    }

    // Navbar navigation
    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.nav;

            // Update active state for all nav buttons
            document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            closeMobileNav();

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
            } else if (target === 'app') {
                document.getElementById('android-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    const footerYear = document.getElementById('footer-year');
    if (footerYear) {
        footerYear.textContent = String(new Date().getFullYear());
    }

    setupAndroidAd();

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

        document.querySelectorAll('.reveal').forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.92) {
                el.classList.add('is-visible');
            } else {
                revealObserver.observe(el);
            }
        });
    } else {
        document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    }

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

function setupAndroidAd() {
    const video = document.getElementById('android-ad-video');
    const muteBtn = document.getElementById('android-mute-btn');
    if (!video || !muteBtn) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const syncMuteUi = () => {
        muteBtn.classList.toggle('is-muted', video.muted);
        muteBtn.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
    };

    const tryPlay = () => {
        const play = video.play();
        if (play && typeof play.catch === 'function') {
            play.catch(() => {});
        }
    };

    muteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        video.muted = !video.muted;
        syncMuteUi();
        tryPlay();
    });

    syncMuteUi();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        video.pause();
        return;
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) tryPlay();
                else video.pause();
            });
        }, { threshold: 0.2 });
        observer.observe(video);
    } else {
        tryPlay();
    }
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
    const developerBtn = document.getElementById('developer-page-btn');
    developerBtn?.addEventListener('click', () => {
        window.location.href = 'dev.html';
    });
    developerBtn?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.location.href = 'dev.html';
        }
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
        window.creativeReturnPage = 'creative-fields-page';
        PageManager.showPage('creative-page');
        const previewCard = document.getElementById('creative-card');
        previewCard?.classList.remove('has-landed', 'is-peeking');
        if (previewCard) void previewCard.offsetWidth;
        document.getElementById('creative-card-title').textContent = title;
        document.getElementById('creative-card-content').textContent = content;
    });

    document.getElementById('save-card-btn')?.addEventListener('click', () => {
        PageManager.showPage(window.creativeReturnPage || 'creative-fields-page');
    });

    setupCreativeFormats();
}

function setupCreativeFormats() {
    const card = document.getElementById('creative-card');
    const page = document.getElementById('creative-page');
    const rail = document.querySelector('.creative-format-rail');
    const chips = document.querySelectorAll('.creative-format-chip');
    if (!card || !rail || !chips.length) return;

    const formats = new Set(['quote', 'journal', 'noir', 'frame']);
    const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let approved = 'quote';
    let open = false;
    let collapseTimer = 0;

    const paintFormat = (format, { peek = false } = {}) => {
        if (!formats.has(format)) format = 'quote';
        card.dataset.format = format;
        if (page) page.dataset.format = format;
        if (!peek || reduceMotion()) {
            card.classList.remove('is-peeking');
            return;
        }
        card.classList.remove('is-peeking');
        void card.offsetWidth;
        card.classList.add('is-peeking');
    };

    const markApproved = () => {
        chips.forEach((chip) => {
            const on = chip.dataset.format === approved;
            chip.classList.toggle('is-active', on);
            chip.setAttribute('aria-pressed', String(on));
        });
    };

    const persist = (format) => {
        approved = format;
        try {
            localStorage.setItem('todoo-creative-format', format);
        } catch (err) {
            /* ignore quota / private mode */
        }
        markApproved();
    };

    const setOpen = (next) => {
        if (open === next) return;
        open = next;
        rail.classList.toggle('is-open', next);
        rail.setAttribute('aria-expanded', String(next));
        if (!next) {
            chips.forEach((chip) => chip.classList.remove('is-previewing'));
            paintFormat(approved);
        }
    };

    try {
        approved = localStorage.getItem('todoo-creative-format') || 'quote';
    } catch (err) {
        approved = 'quote';
    }
    if (!formats.has(approved)) approved = 'quote';
    paintFormat(approved);
    markApproved();

    card.addEventListener('animationend', (e) => {
        if (e.animationName === 'card-in') {
            card.classList.add('has-landed');
        }
        if (e.animationName === 'format-peek') {
            card.classList.remove('is-peeking');
        }
    });

    const scheduleCollapse = (delay = 240) => {
        clearTimeout(collapseTimer);
        collapseTimer = window.setTimeout(() => setOpen(false), delay);
    };

    const cancelCollapse = () => {
        clearTimeout(collapseTimer);
        setOpen(true);
    };

    rail.addEventListener('pointerenter', cancelCollapse);
    rail.addEventListener('pointerleave', () => {
        chips.forEach((chip) => chip.classList.remove('is-previewing'));
        paintFormat(approved);
        scheduleCollapse();
    });

    chips.forEach((chip) => {
        chip.addEventListener('pointerenter', (e) => {
            if (!open || e.pointerType === 'touch') return;
            chips.forEach((other) => other.classList.toggle('is-previewing', other === chip));
            paintFormat(chip.dataset.format, { peek: true });
        });

        chip.addEventListener('focus', () => {
            cancelCollapse();
            chips.forEach((other) => other.classList.toggle('is-previewing', other === chip));
            paintFormat(chip.dataset.format, { peek: true });
        });

        chip.addEventListener('click', () => {
            const format = chip.dataset.format;
            if (!open) {
                cancelCollapse();
                chips.forEach((other) => other.classList.toggle('is-previewing', other === chip));
                paintFormat(format, { peek: true });
                return;
            }
            persist(format);
            paintFormat(format, { peek: true });
            chip.classList.add('is-picked');
            window.setTimeout(() => chip.classList.remove('is-picked'), 480);
        });
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
