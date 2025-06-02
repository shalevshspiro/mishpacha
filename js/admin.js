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
let extraFileUrl = "";
let extraImagesUrls = [];

document.addEventListener("DOMContentLoaded", async () => {
  const loginForm = document.getElementById("loginForm");
  const articleForm = document.getElementById("articleForm");
  const adminPanel = document.getElementById("adminPanel");
  const logoutButton = document.getElementById("logout");
  const articleSelect = document.getElementById("articleSelect");
  const deleteBtn = document.getElementById("deleteBtn");
  const collectionSelect = document.getElementById("collectionSelect");

  const quill = new Quill("#editor", {
    theme: "snow",
    placeholder: "כתוב כאן את תוכן הכתבה..."
  });

  // העלאת תמונה לכתבה
  document.getElementById("imageUpload").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadToCloudinary(file);
    imageUrl = url;
    const img = document.getElementById("previewImage");
    img.src = url;
    img.style.display = "block";
  });

  // תמונות נוספות לכתבה
  document.getElementById("extraImagesUpload").addEventListener("change", async (e) => {
    const files = Array.from(e.target.files);
    extraImagesUrls = [];
    const container = document.getElementById("extraImagesPreview");
    container.innerHTML = "";
    for (const file of files) {
      const url = await uploadToCloudinary(file);
      extraImagesUrls.push(url);
      const img = document.createElement("img");
      img.src = url;
      img.style.maxWidth = "100px";
      img.style.borderRadius = "8px";
      container.appendChild(img);
    }
  });

  // קובץ נוסף לכתבה
  document.getElementById("extraFileUpload").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadToCloudinary(file, true);
    extraFileUrl = url;
    const link = document.getElementById("extraFileLink");
    link.href = url;
    link.textContent = file.name;
    document.getElementById("extraFileLinkContainer").style.display = "block";
  });

  articleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const intro = document.getElementById("intro").value.trim();
    const category = document.getElementById("category").value;
    const order = parseInt(document.getElementById("order")?.value) || 0;
    const content = quill.root.innerHTML;
    const collectionName = collectionSelect.value || "articles";

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
      extraFile: extraFileUrl,
      extraImages: extraImagesUrls,
      updatedAt: serverTimestamp()
    };

    if (collectionName === "info") {
      data.order = order;
    }

    try {
      if (collectionName === "articles" && selectedDocId) {
        await updateDoc(doc(db, "articles", selectedDocId), data);
        alert("כתבה עודכנה בהצלחה.");
      } else {
        await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: serverTimestamp()
        });
        alert("נשמר בהצלחה.");
      }
      resetForm();
      if (collectionName === "articles") await loadArticles();
    } catch (err) {
      alert("שגיאה: " + err.message);
    }
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
      .catch((err) => alert("שגיאה: " + err.message));
  });

  logoutButton.addEventListener("click", () => signOut(auth).then(() => location.reload()));

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

  function resetForm() {
    selectedDocId = null;
    articleForm.reset();
    quill.setText("");
    imageUrl = "";
    extraFileUrl = "";
    extraImagesUrls = [];
    document.getElementById("previewImage").style.display = "none";
    document.getElementById("extraFileLinkContainer").style.display = "none";
    document.getElementById("extraImagesPreview").innerHTML = "";
    articleSelect.value = "";
    deleteBtn.style.display = "none";
  }

  function uploadToCloudinary(file, isDoc = false) {
    return new Promise(async (resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "mishpacha");
      const res = await fetch(`https://api.cloudinary.com/v1_1/dx2xpx9jg/${isDoc ? "auto" : "image"}/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) resolve(data.secure_url);
      else reject("upload failed");
    });
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginForm.style.display = "none";
      adminPanel.style.display = "block";
      logoutButton.style.display = "block";
      loadArticles();
    } else {
      loginForm.style.display = "block";
      adminPanel.style.display = "none";
      logoutButton.style.display = "none";
    }
  });
});
