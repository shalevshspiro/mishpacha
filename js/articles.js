import { db } from './firebase.js';
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("articles-container");

  try {
    const q = query(collection(db, "articles"), orderBy("date", "desc"));
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

      card.innerHTML = `
        <h2>${title}</h2>
        <p>${intro}</p>
        <a href="article.html?id=${doc.id}">לקריאה מלאה</a>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("שגיאה בטעינת כתבות:", error);
    container.innerHTML = "<p>אירעה שגיאה בטעינת הכתבות.</p>";
  }
});
