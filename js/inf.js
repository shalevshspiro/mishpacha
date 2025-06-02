import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// שליפת כל המסמכים
const fetchInfo = async () => {
  const ref = collection(db,"info");
  const q = query(ref, orderBy("order"));
  const snapshot = await getDocs(q);
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

// הצגת כל הפריטים לפי קטגוריה
let allData = [];
const filterByCategory = (category) => {
  const filtered = allData.filter(item => item.category === category);
  renderInfo(filtered);
};

// הצגת פריטי מידע
const renderInfo = (items) => {
  const container = document.getElementById("info-list");
  container.innerHTML = "";

  items.forEach(item => {
    const box = document.createElement("div");
    box.className = "article-box";

    const title = document.createElement("div");
    title.className = "article-title";
    title.textContent = item.title;
    title.onclick = () => {
      content.style.display = content.style.display === "none" ? "block" : "none";
    };

    const content = document.createElement("div");
    content.className = "article-content";
    content.innerHTML = item.content || "";

    box.appendChild(title);
    box.appendChild(content);
    container.appendChild(box);
  });
};

// טעינה ראשונית
fetchInfo().then(data => {
  allData = data;
  renderCategories(allData.map(d => d.category));
});
