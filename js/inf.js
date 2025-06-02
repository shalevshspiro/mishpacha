import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const fetchInfo = async () => {
  const ref = collection(db, "info");
  const q = query(ref, orderBy("order"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const renderCategories = (categories) => {
  const container = document.getElementById("categories");
  container.classList.add("category-list");
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
    const wrapper = document.createElement("div");
    wrapper.className = "info-box";

    const title = document.createElement("div");
    title.className = "info-title";
    title.textContent = item.title;

    const content = document.createElement("div");
    content.className = "info-content";
    content.style.display = "none";

    if (item.content) {
      const contentHTML = document.createElement("div");
      contentHTML.innerHTML = item.content;
      content.appendChild(contentHTML);
    }

    // ✅ תמונה ראשית - מגיעה כשדה image
    if (item.image) {
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = "תמונה ראשית";
      img.className = "main-image";
      content.appendChild(img);
    }

    // ✅ תמונות נוספות
    if (Array.isArray(item.extraImages)) {
      const extraWrapper = document.createElement("div");
      extraWrapper.className = "extra-images";
      item.extraImages.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "תמונה נוספת";
        img.className = "extra-image";
        extraWrapper.appendChild(img);
      });
      content.appendChild(extraWrapper);
    }

    // ✅ קובץ מצורף
    if (item.extraFile) {
      const fileLink = document.createElement("a");
      fileLink.href = item.extraFile;
      fileLink.target = "_blank";
      fileLink.className = "file-link";
      fileLink.textContent = "📄 לחץ להורדת המסמך המצורף";
      content.appendChild(fileLink);
    }

    title.onclick = () => {
      content.style.display = content.style.display === "none" ? "block" : "none";
    };

    wrapper.appendChild(title);
    wrapper.appendChild(content);
    container.appendChild(wrapper);
  });
};

fetchInfo().then(data => {
  allData = data;
  renderCategories(allData.map(d => d.category));
});
