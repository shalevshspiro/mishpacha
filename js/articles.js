import { db } from './firebase.js';
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("articles-container");

  try {
    const q = collection(db, "articles");
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = "<p>לא נמצאו כתבות.</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "article-card";

      const title = data.title || "כתבה ללא כותרת";
      const intro = data.intro || "אין תקציר זמין.";
      const image = data.image || "";
      const logo = data.logo || "";
      const extraFile = data.extraFile || "";

      let html = "";

      if (logo) {
        html += `<img src="${logo}" alt="לוגו" class="article-logo" style="width: 40px; height: 40px; float: left; margin-left: 10px; border-radius: 50%;">`;
      }

      if (image) {
        html += `<img src="${image}" alt="תמונה ראשית" class="article-thumb" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 10px;">`;
      }

      html += `
        <h2>${title}</h2>
        <p>${intro}</p>
        <a href="article.html?id=${doc.id}">לקריאה מלאה</a>
      `;

      if (extraFile) {
        html += `
          <p style="margin-top: 10px;">
            <a href="${extraFile}" target="_blank">📎 לצפייה בקובץ</a>
          </p>
        `;
      }

      card.innerHTML = html;
      container.appendChild(card);
    });

  } catch (error) {
    console.error("שגיאה בטעינת כתבות:", error);
    container.innerHTML = "<p>אירעה שגיאה בטעינת הכתבות.</p>";
  }
});
