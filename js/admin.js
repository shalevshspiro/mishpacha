// js/admin.js
import { db, auth } from './firebase.js';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let selectedDocId = null;
let imageUrl = "";

document.addEventListener("DOMContentLoaded", async () => {
  const loginForm = document.getElementById("loginForm");
  const articleForm = document.getElementById("articleForm");
  const adminPanel = document.getElementById("adminPanel");
  const logoutButton = document.getElementById("logout");
  const articleSelect = document.getElementById("articleSelect");
  const deleteBtn = document.getElementById("deleteBtn");

  const imageUpload = document.getElementById("imageUpload");
  const previewImage = document.getElementById("previewImage");

  window.quill = new Quill("#editor", {
    theme: "snow",
    placeholder: "כתוב כאן את תוכן הכתבה..."
  });

  // Cloudinary - תמונה
  imageUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "YOUR_UPLOAD_PRESET"); // ← להחליף בעתיד
    formData.append("cloud_name", "YOUR_CLOUD_NAME");        // ← להחליף בעתיד

    const res = await fetch("https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    imageUrl = data.secure_url;
    previewImage.src = imageUrl;
    previewImage.style.display = "block";
  });

  // התחברות
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        loginForm.style.display = "none";
        adminPanel.style.display = "block";
        logoutButton.style.display = "block";
        loadArticles();
      })
      .catch((error) => {
        alert("שגיאה: " + error.message);
      });
  });

  logoutButton.addEventListener("click", () => {
    signOut(auth).then(() => location.reload());
  });

  // טעינת כתבות
  async function loadArticles() {
    const snapshot = await getDocs(collection(db, "articles"));
    articleSelect.innerHTML = `<option value="">+ כתבה חדשה</option>`;
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const option = document.createElement("option");
      option.value = docSnap.id;
      option.textContent = data.title;
      articleSelect.appendChild(option);
    });
  }

  // בחירת כתבה
  articleSelect.addEventListener("change", async () => {
    const id = articleSelect.value;
    if (!id) {
      resetForm();
      return;
    }

    selectedDocId = id;
    const docRef = doc(db, "articles", id);
    const docSnap = await getDocs(collection(db, "articles"));
    const found = Array.from(docSnap.docs).find(d => d.id === id);
    if (!found) return;

    const data = found.data();
    document.getElementById("title").value = data.title || "";
    document.getElementById("intro").value = data.intro || "";
    document.getElementById("category").value = data.category || "";
    quill.root.innerHTML = data.content || "";

    imageUrl = data.image || "";
    previewImage.src = imageUrl;
    previewImage.style.display = imageUrl ? "block" : "none";
    deleteBtn.style.display = "inline-block";
  });

  // שמירה/עדכון כתבה
  articleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const intro = document.getElementById("intro").value.trim();
    const category = document.getElementById("category").value;
    const content = quill.root.innerHTML;

    if (!title || !content) {
      alert("יש למלא לפחות כותרת ותוכן.");
      return;
    }

    const data = {
      title,
      intro,
      category,
      content,
      image: imageUrl,
      updatedAt: serverTimestamp()
    };

    try {
      if (selectedDocId) {
        const ref = doc(db, "articles", selectedDocId);
        await updateDoc(ref, data);
        alert("כתבה עודכנה בהצלחה.");
      } else {
        await addDoc(collection(db, "articles"), {
          ...data,
          createdAt: serverTimestamp()
        });
        alert("כתבה חדשה נוספה.");
      }

      resetForm();
      await loadArticles();
    } catch (error) {
      console.error("שגיאה:", error);
      alert("שגיאה בשמירה: " +
