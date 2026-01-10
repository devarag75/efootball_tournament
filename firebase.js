// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Your Firebase config
// (from Project Settings → General → Web App → Config)
const firebaseConfig = {
  apiKey: "AIzaSyB-17Br-JAG6xfiLM9-rFCMVgaK0qMyeuA",
  authDomain: "tournament-points-169e2.firebaseapp.com",
  projectId: "tournament-points-169e2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
