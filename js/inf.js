import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const fetchInfo = async () => {
  const ref = collection(db, "info");
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

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

let allData = [];

const filterByCategory = (category) => {
  const filtered = allData.filter(item => item.category === category);
  renderInfo(filtered);
};

const renderInfo = (items) => {
  const container = document.getElementById("info-list");
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = "<p>לא נמצא מידע.</p>";
    return;
  }

  items.forEach(item => {
    if (
      item.title.includes("בדיקה") ||
      item.category.includes("בדיקה") ||
      item.title.includes("כיתה א")
    ) return;

    const box = document.createElement("div");
    box.className = "info-box";

    const title = document.createElement("div");
    title.className = "info-title";
    title.textContent = item.title;

    const content = document.createElement("div");
    content.className = "info-content";

    if (item.image) {
      const img = document.createElement("img");
      img.src = item.image;
      img.className = "main-image";
      content.appendChild(img);
    }

    const html = document.createElement("div");
    html.innerHTML = item.content || "";
    content.appendChild(html);

    if (item.extraFile) {
      const fileLink = document.createElement("a");
      fileLink.href = item.extraFile;
      fileLink.target = "_blank";
      fileLink.textContent = "📎 פתיחת קובץ מצורף";
      fileLink.className = "file-link";
      content.appendChild(fileLink);
    }

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

fetchInfo().then(data => {
  allData = data;
  renderCategories(allData.map(d => d.category));
});
