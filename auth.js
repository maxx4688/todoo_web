// Authentication Module

const Auth = {
    currentUser: null,

    init() {
        // Listen for auth state changes
        window.firebaseAuth.onAuthStateChanged((user) => {
            this.currentUser = user;
            if (user) {
                this.onAuthSuccess(user);
            } else {
                this.onAuthFailure();
            }
        });

        // Check if user is already logged in
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn && !this.currentUser) {
            PageManager.showPage('auth-page');
        }
    },

    async login(email, password) {
        try {
            Loading.show();
            const userCredential = await window.firebaseAuth.signInWithEmailAndPassword(email, password);
            
            // Check if user exists in Firestore
            const userDoc = await window.firebaseDb.collection('users').doc(userCredential.user.uid).get();
            
            if (userDoc.exists) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('email', email);
                localStorage.setItem('userId', userCredential.user.uid);
                Toast.success('Login successful!');
                return true;
            } else {
                Toast.error('User not found, Try creating a new account');
                await this.logout();
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            Toast.error(this.getErrorMessage(error));
            return false;
        } finally {
            Loading.hide();
        }
    },

    async signup(email, password) {
        try {
            Loading.show();
            const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
            
            // Add user data to Firestore
            await window.firebaseDb.collection('users').doc(userCredential.user.uid).set({
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('email', email);
            localStorage.setItem('userId', userCredential.user.uid);
            Toast.success('Account created successfully!');
            return true;
        } catch (error) {
            console.error('Signup error:', error);
            Toast.error(this.getErrorMessage(error));
            return false;
        } finally {
            Loading.hide();
        }
    },

    async forgotPassword(email) {
        try {
            Loading.show();
            await window.firebaseAuth.sendPasswordResetEmail(email);
            Toast.success('Password reset email sent!');
            PageManager.hideModal('forgot-password-modal');
            return true;
        } catch (error) {
            console.error('Forgot password error:', error);
            Toast.error(this.getErrorMessage(error));
            return false;
        } finally {
            Loading.hide();
        }
    },

    async logout() {
        try {
            await window.firebaseAuth.signOut();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('email');
            localStorage.removeItem('userId');
            this.currentUser = null;
            PageManager.showPage('auth-page');
            Toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            Toast.error('Failed to logout');
        }
    },

    onAuthSuccess(user) {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            PageManager.showPage('home-page');
            // Refresh notes if Notes module is initialized
            if (window.Notes && typeof window.Notes.loadNotes === 'function') {
                window.Notes.loadNotes();
            }
        }
    },

    onAuthFailure() {
        // Only redirect to auth if not already there
        if (document.getElementById('auth-page').classList.contains('active')) {
            return;
        }
        // Don't auto-redirect on page load if user was logged in
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            PageManager.showPage('auth-page');
        }
    },

    getErrorMessage(error) {
        if (error.code === 'auth/user-not-found') {
            return 'User not found, Try creating a new account';
        } else if (error.code === 'auth/wrong-password') {
            return 'Wrong password';
        } else if (error.code === 'auth/email-already-in-use') {
            return 'User with this email already exists, Try logging in';
        } else if (error.code === 'auth/weak-password') {
            return 'Password should be at least 6 characters';
        } else if (error.code === 'auth/invalid-email') {
            return 'Invalid email address';
        } else if (error.code === 'auth/user-disabled') {
            return 'This account has been disabled';
        } else if (error.message) {
            return error.message;
        }
        return 'An error occurred. Please try again.';
    },

    isAuthenticated() {
        return this.currentUser !== null && localStorage.getItem('isLoggedIn') === 'true';
    },

    getUserId() {
        return this.currentUser ? this.currentUser.uid : localStorage.getItem('userId');
    }
};

// Export
window.Auth = Auth;
