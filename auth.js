// Authentication Module

const Auth = {
    currentUser: null,

    init() {
        // Keep Firebase auth user in sync.
        // Redirects are handled in the individual pages (auth.html / index.html).
        window.firebaseAuth.onAuthStateChanged((user) => {
            this.currentUser = user;
        });
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
            // After logout, send user to dedicated auth page
            window.location.href = 'auth.html';
            Toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            Toast.error('Failed to logout');
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
        // Rely on the local flag; Firebase currentUser may lag slightly.
        return localStorage.getItem('isLoggedIn') === 'true';
    },

    getUserId() {
        return this.currentUser ? this.currentUser.uid : localStorage.getItem('userId');
    }
};

// Export
window.Auth = Auth;
