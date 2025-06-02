import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// שליפת כל המסמכים מאוסף info
const fetchInfo = async () => {
  const ref = collection(db, "info");
  const snapshot = await getDocs(ref); // ללא orderBy
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// הצגת כפתורי קטגוריות
const renderCategories = (categories) => {
  const container = document.getElementById("categories");
  container.innerHTML = "";

  const uniqueCategories = [...new Set(categories)];
  uniqueCategories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.className = "category-button";
    btn.onclick = () => filterByCategory(cat);
    container.appendChild(btn);
  });
};

// כל המידע שנטען
let allData = [];

// סינון לפי קטגוריה
const filterByCategory = (category) => {
  const filtered = allData.filter(item => item.category === category);
  renderInfo(filtered);
};

// הצגת המידע בפורמט רשימה אנכית
const renderInfo = (items) => {
  const container = document.getElementById("info-list");
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = "<p>לא נמצא מידע.</p>";
    return;
  }

  items.forEach(item => {
    const box = document.createElement("div");
    box.className = "article-box";

    const title = document.createElement("div");
    title.className = "article-title";
    title.textContent = item.title;

    const content = document.createElement("div");
    content.className = "article-content";
    content.style.display = "none";

    // תמונה ראשית
    if (item.image) {
      const img = document.createElement("img");
      img.src = item.image;
      img.className = "main-image";
      content.appendChild(img);
    }

    // תוכן עשיר
    const html = document.createElement("div");
    html.innerHTML = item.content || "";
    content.appendChild(html);

    // קובץ מצורף
    if (item.extraFile) {
      const fileLink = document.createElement("a");
      fileLink.href = item.extraFile;
      fileLink.target = "_blank";
      fileLink.textContent = "📎 פתיחת קובץ מצורף";
      fileLink.className = "file-link";
      content.appendChild(fileLink);
    }

    // גלריית תמונות נוספות
    if (item.extraImages && item.extraImages.length > 0) {
      const gallery = document.createElement("div");
      gallery.className = "extra-gallery";
      item.extraImages.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.className = "extra-image";
        gallery.appendChild(img);
      });
      content.appendChild(gallery);
    }

    title.onclick = () => {
      content.style.display = content.style.display === "none" ? "block" : "none";
    };

    box.appendChild(title);
    box.appendChild(content);
    container.appendChild(box);
  });
};

// טעינה ראשונית
fetchInfo().then(data => {
  allData = data;
  renderCategories(allData.map(d => d.category));
  renderInfo(allData); // הצגה ראשונית של הכל
});
