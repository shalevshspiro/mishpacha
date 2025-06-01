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

  const imageUpload = document.getElementById("imageUpload");
  const previewImage = document.getElementById("previewImage");

  const extraFileUpload = document.getElementById("extraFileUpload");
  const extraFileLink = document.getElementById("extraFileLink");
  const extraFileLinkContainer = document.getElementById("extraFileLinkContainer");

  const extraImagesUpload = document.getElementById("extraImagesUpload");
  const extraImagesPreview = document.getElementById("extraImagesPreview");

  window.quill = new Quill("#editor", {
    theme: "snow",
    placeholder: "כתוב כאן את תוכן הכתבה..."
  });

  // העלאת תמונה ראשית
  imageUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mishpacha");

    const res = await fetch("https://api.cloudinary.com/v1_1/dx2xpx9jg/image/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    imageUrl = data.secure_url;
    previewImage.src = imageUrl;
    previewImage.style.display = "block";
  });

  // העלאת תמונות נוספות
  extraImagesUpload.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files);
    extraImagesUrls = [];
    extraImagesPreview.innerHTML = "";

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "mishpacha");

      const res = await fetch("https://api.cloudinary.com/v1_1/dx2xpx9jg/image/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      extraImagesUrls.push(data.secure_url);

      const img = document.createElement("img");
      img.src = data.secure_url;
      img.style.maxWidth = "100px";
      img.style.borderRadius = "8px";
      extraImagesPreview.appendChild(img);
    }
  });

  // העלאת מסמך נוסף
  extraFileUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mishpacha");

    const res = await fetch("https://api.cloudinary.com/v1_1/dx2xpx9jg/auto/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    extraFileUrl = data.secure_url;
    extraFileLink.href = extraFileUrl;
    extraFileLink.textContent = file.name;
    extraFileLinkContainer.style.display = "block";
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

    extraFileUrl = data.extraFile || "";
    if (extraFileUrl) {
      extraFileLink.href = extraFileUrl;
      extraFileLink.textContent = "צפה בקובץ";
      extraFileLinkContainer.style.display = "block";
    } else {
      extraFileLinkContainer.style.display = "none";
    }

    extraImagesUrls = data.extraImages || [];
    extraImagesPreview.innerHTML = "";
    extraImagesUrls.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      img.style.maxWidth = "100px";
      img.style.borderRadius = "8px";
      extraImagesPreview.appendChild(img);
    });

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
      extraFile: extraFileUrl,
      extraImages: extraImagesUrls,
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
      alert("שגיאה בשמירה: " + error.message);
    }
  });

  // מחיקה
  deleteBtn.addEventListener("click", async () => {
    if (!selectedDocId) return;
    if (!confirm("האם אתה בטוח שברצונך למחוק את הכתבה?")) return;

    try {
      await deleteDoc(doc(db, "articles", selectedDocId));
      alert("כתבה נמחקה.");
      resetForm();
      await loadArticles();
    } catch (error) {
      console.error("שגיאה במחיקה:", error);
      alert("שגיאה במחיקה: " + error.message);
    }
  });

  function resetForm() {
    selectedDocId = null;
    articleForm.reset();
    quill.setText("");
    imageUrl = "";
    extraFileUrl = "";
    extraImagesUrls = [];
    previewImage.style.display = "none";
    extraFileLinkContainer.style.display = "none";
    extraImagesPreview.innerHTML = "";
    articleSelect.value = "";
    deleteBtn.style.display = "none";
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
	import { db } from "./firebase.js";
import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// עורך Quill עבור המידע
const infoEditor = new Quill("#info-editor", {
  theme: "snow",
  placeholder: "כתוב כאן את התוכן...",
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "blockquote", "code-block"],
    ],
  },
});

// כפתור לשליחת מידע לאוסף info
document.getElementById("submit-info").addEventListener("click", async () => {
  const title = document.getElementById("info-title").value.trim();
  const category = document.getElementById("info-category").value.trim();
  const order = parseInt(document.getElementById("info-order").value);
  const content = infoEditor.root.innerHTML.trim();

  if (!title || !category || isNaN(order) || !content) {
    alert("נא למלא את כל השדות");
    return;
  }

  try {
    await addDoc(collection(db, "info"), {
      title,
      category,
      content,
      order
    });
    alert("המידע נשמר בהצלחה");
    // איפוס הטופס
    document.getElementById("info-title").value = "";
    document.getElementById("info-category").value = "";
    document.getElementById("info-order").value = "";
    infoEditor.root.innerHTML = "";
  } catch (error) {
    console.error("שגיאה בשמירת המידע:", error);
    alert("אירעה שגיאה. נסה שוב.");
  }
});

  });
});
