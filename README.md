# ToDoo Web Application

A web version of the ToDoo Flutter app built with HTML, CSS, and JavaScript. This application provides the same functionality as the mobile app, excluding widget and share-to-save features.

## Standalone / Portable

**This folder is fully self-contained.** It does not depend on the Flutter project or any parent directory. You can:

- **Move** the entire `html` folder anywhere (e.g. `~/Projects/todoo-web`, a USB drive, another repo).
- **Run** it from inside this folder only. All assets (CSS, JS, config) use relative paths.
- **Share** it as a standalone web app. No Flutter, no build step.

**To run after moving:**

1. Open a terminal in this folder (`cd` into the `html` directory).
2. Start a local server using one of the options below.
3. Open `http://localhost:8080` in your browser.

**Quick start (from this folder):**

```bash
# Option A: Run script (tries Python, then Node)
./run.sh          # macOS / Linux
run.bat           # Windows

# Option B: npm
npm start

# Option C: Python
python3 -m http.server 8080
```

> **Important:** Always serve over HTTP (e.g. `http://localhost:8080`). Opening `index.html` via `file://` can cause CORS issues with Firebase.

**Checklist when moving this folder:**

1. Copy the **entire** `html` folder to the new location.
2. Ensure `firebase-config.js` exists (copy from `firebase-config.example.js` if needed) and contains your Firebase config.
3. Run a local server **from inside** the `html` folder (e.g. `./run.sh`, `npm start`, or `python3 -m http.server 8080`).
4. Open `http://localhost:8080` in your browser.

## Features

- ✅ User Authentication (Login, Signup, Forgot Password)
- ✅ Create, Edit, Delete Notes
- ✅ Checklists within notes
- ✅ Favorite Notes
- ✅ Search Functionality
- ✅ URL Detection and Clickable Links
- ✅ Dark/Light Mode
- ✅ Custom Theme Colors (Predefined + Custom Color Picker)
- ✅ Glassmorphism UI Toggle
- ✅ Grid/List View Toggle
- ✅ Creative Fields
- ✅ Real-time Firebase Sync
- ✅ Responsive Design

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider
4. Create Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see below)
5. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on the web icon (`</>`) to add a web app
   - Copy the Firebase configuration object

### 2. Update Firebase Config

Copy `firebase-config.example.js` to `firebase-config.js`, then replace the placeholder values with your Firebase configuration. (If `firebase-config.js` already exists, edit it directly.)

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Firestore Security Rules

Set up the following security rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /notes/{noteId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 4. Running the Application

Run **from inside this folder** (the `html` directory):

#### Option 1: Run scripts (portable)

```bash
./run.sh     # macOS / Linux (uses Python or Node)
run.bat      # Windows
```

#### Option 2: npm

```bash
npm start    # Uses npx http-server on port 8080
```

#### Option 3: Python

```bash
python3 -m http.server 8080
# or
python -m SimpleHTTPServer 8080
```

Then open **`http://localhost:8080`** in your browser.

#### Option 4: VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"
3. Use the URL it opens (usually port 5500)

#### Option 5: Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Hosting
firebase init hosting

# Deploy
firebase deploy
```

## File Structure

Everything needed to run the app lives in this folder:

```
html/
├── index.html              # Main HTML (SPA)
├── styles.css              # All styling and themes
├── fonts/                  # Local fonts (Poppins, Arizonia) — no Google Fonts CDN
│   ├── Arizonia.ttf
│   ├── Poppins-Regular.ttf
│   ├── Poppins-Semibold.ttf
│   └── Poppins-Bold.ttf
├── firebase-config.js      # Firebase config (copy from firebase-config.example.js)
├── firebase-config.example.js  # Template; replace placeholders and copy to firebase-config.js
├── utils.js                # Theme, URL detection, toast, etc.
├── auth.js                 # Authentication
├── notes.js                # Notes CRUD
├── app.js                  # App logic and UI wiring
├── package.json            # npm start → local server
├── run.sh                  # Run script (macOS/Linux)
├── run.bat                 # Run script (Windows)
├── .gitignore              # Ignores node_modules, etc.
└── README.md               # This file
```

**Fonts & assets:** Bundled in `fonts/` (Poppins, Arizonia). No Google Fonts or other CDN assets.

**External (CDN):** Firebase SDK only. No other local dependencies outside this folder.

## Usage

1. **Sign Up**: Create a new account with email and password
2. **Login**: Use your credentials to access your notes
3. **Create Note**: Click "Add new" button to create a new note
4. **Edit Note**: Click the edit icon on any note card
5. **View Note**: Click on a note card to view full details
6. **Delete Note**: Click "Delete" button on a note card
7. **Favorite**: Click the heart icon to favorite/unfavorite notes
8. **Search**: Click the search icon to search through your notes
9. **Settings**: Click the menu icon to access settings
   - Toggle Dark/Light mode
   - Toggle Glassmorphism UI
   - Toggle Grid/List view
   - Change theme color
10. **Creative Fields**: Click the document icon to create creative notes

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- The app uses localStorage to persist theme preferences
- Firebase handles all data persistence and real-time sync
- URL detection automatically makes links clickable
- Checklists can be added and checked off within notes
- The app is fully responsive and works on mobile devices

## Troubleshooting

### Firebase not initializing
- Check that you've updated `firebase-config.js` with your credentials
- Verify Firebase SDK scripts are loading (check browser console)

### Authentication not working
- Ensure Email/Password provider is enabled in Firebase Console
- Check browser console for error messages

### Notes not loading
- Verify Firestore security rules are set correctly
- Check that you're logged in (check localStorage for 'isLoggedIn')

### Styling issues
- Clear browser cache
- Check that CSS file is loading correctly

## Differences from Flutter App

- ❌ Widget functionality (not applicable for web)
- ❌ Share to save todoo (simplified to standard share)
- ✅ All other features are implemented

## License

Same as the main ToDoo project.
