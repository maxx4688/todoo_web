// Firebase Configuration
// TODO: Replace with your Firebase project configuration
// Get these values from Firebase Console > Project Settings > General > Your apps

const firebaseConfig = {
    apiKey: "AIzaSyD7gCx3LF4widukg6l7y3LsoudVrgRG6QE",
    authDomain: "todoo-79475.firebaseapp.com",
    projectId: "todoo-79475",
    storageBucket: "todoo-79475.firebasestorage.app",
    messagingSenderId: "397728198974",
    appId: "1:397728198974:web:f35c395c7aab3732a37c6f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other modules
window.firebaseAuth = auth;
window.firebaseDb = db;
