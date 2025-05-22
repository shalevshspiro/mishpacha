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

      const imageHtml = image
        ? `<img src="${image}" alt="תמונה ראשית" class="article-thumb">`
        : `<div class="article-thumb" style="background:#eee;"></div>`;

      const logoHtml = logo
        ? `<img src="${logo}" alt="לוגו" class="article-logo">`
        : "";

      const fileLinkHtml = extraFile
        ? `<a href="${extraFile}" target="_blank" class="file-link">📎 קובץ מצורף</a>`
        : "";

      const contentHtml = `
        <div class="article-card-content">
          ${logoHtml}
          <h2>${title}</h2>
          <p>${intro}</p>
          <a href="article.html?id=${doc.id}">לקריאה מלאה</a>
          ${fileLinkHtml}
        </div>
      `;

      card.innerHTML = imageHtml + contentHtml;
      container.appendChild(card);
    });

  } catch (error) {
    console.error("שגיאה בטעינת כתבות:", error);
    container.innerHTML = "<p>אירעה שגיאה בטעינת הכתבות.</p>";
  }
});
