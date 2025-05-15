// js/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHE-kaS1oNhZ3_YtIKCjVhIfu9HABV-0E",
  authDomain: "articles-671c6.firebaseapp.com",
  projectId: "articles-671c6",
  storageBucket: "articles-671c6.appspot.com",    // ✅ תיקון כאן
  messagingSenderId: "985955307070",
  appId: "1:985955307070:web:a194c0d48df650cba34b6f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore & Auth for use in other files
export const db = getFirestore(app);
export const auth = getAuth(app);
