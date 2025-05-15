// js/admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHE-kaS1oNhZ3_YtIKCjVhIfu9HABV-0E",
  authDomain: "articles-671c6.firebaseapp.com",
  projectId: "articles-671c6",
  storageBucket: "articles-671c6.appspot.com",    // ✅ תיקון כאן
  messagingSenderId: "985955307070",
  appId: "1:985955307070:web:a194c0d48df650cba34b6f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const articleForm = document.getElementById("articleForm");
    const adminPanel = document.getElementById("adminPanel");
    const logoutButton = document.getElementById("logout");

    window.quill = new Quill("#editor", {
        theme: "snow",
        placeholder: "כתוב כאן את תוכן הכתבה..."
    });

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                loginForm.style.display = "none";
                adminPanel.style.display = "block";
                logoutButton.style.display = "block";
            })
            .catch((error) => {
                alert("שגיאה: " + error.message);
            });
    });

    logoutButton.addEventListener("click", () => {
        signOut(auth).then(() => {
            location.reload();
        });
    });

    articleForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("title").value.trim();
        const intro = document.getElementById("intro").value.trim();
        const genre = document.getElementById("genre").value.trim();
        const imageUrl = document.getElementById("imageUrl").value.trim();
        const logoImage = document.getElementById("logoImage").value.trim();
        const content = quill.root.innerHTML;

        if (!title || !content) {
            alert("יש למלא לפחות כותרת ותוכן.");
            return;
        }

        try {
            await addDoc(collection(db, "articles"), {
                title,
                intro,
                genre,
                imageUrl,
                logoImage,
                content,
                createdAt: serverTimestamp()
            });

            alert("כתבה נוספה בהצלחה!");
            articleForm.reset();
            quill.setText("");
        } catch (error) {
            console.error("שגיאה בהוספת כתבה:", error);
            alert("שגיאה: " + error.message);
        }
    });

    onAuthStateChanged(auth, (user) => {
        if (user) {
            loginForm.style.display = "none";
            adminPanel.style.display = "block";
            logoutButton.style.display = "block";
        } else {
            loginForm.style.display = "block";
            adminPanel.style.display = "none";
            logoutButton.style.display = "none";
        }
    });
});
