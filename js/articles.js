// js/articles.js

import { db } from './firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("articles-container");

  try {
    const q = query(collection(db, "articles"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "article-card";
      card.innerHTML = `
        <h2>${data.title}</h2>
        <p>${data.intro}</p>
        <a href="article.html?id=${doc.id}">לקריאה מלאה</a>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("שגיאה בטעינת כתבות:", error);
  }
});
