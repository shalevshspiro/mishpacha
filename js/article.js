import { db } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const titleEl = document.getElementById("article-title");
  const contentEl = document.getElementById("article-content");
  const imageEl = document.getElementById("article-image");

  if (!id) {
    titleEl.textContent = "כתבה לא נמצאה";
    contentEl.textContent = "לא סופק מזהה כתבה.";
    return;
  }

  try {
    const docRef = doc(db, "articles", id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      titleEl.textContent = "כתבה לא קיימת";
      contentEl.textContent = "נראה שהכתבה נמחקה או לא קיימת.";
      return;
    }

    const data = snapshot.data();
    titleEl.textContent = data.title || "כתבה ללא כותרת";
    contentEl.innerHTML = data.content || "<p>אין תוכן זמין לכתבה זו.</p>";

    if (data.image) {
      imageEl.src = data.image;
      imageEl.style.display = "block";
    } else {
      imageEl.style.display = "none";
    }
  } catch (error) {
    titleEl.textContent = "שגיאה בטעינת כתבה";
    contentEl.textContent = error.message;
    console.error("שגיאה:", error);
  }
});
