import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const fetchInfo = async () => {
  const ref = collection(db, "info");
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const groupByCategory = (data) => {
  const map = {};
  data.forEach(item => {
    const cat = item.category || "ללא קטגוריה";
    if (!map[cat]) map[cat] = [];
    map[cat].push(item);
  });
  return map;
};

const createInfoBox = (item) => {
  const box = document.createElement("div");
  box.className = "info-box";

  const title = document.createElement("div");
  title.className = "info-title";
  title.textContent = item.title;

  const content = document.createElement("div");
  content.className = "info-content";

  if (item.intro) {
    const intro = document.createElement("p");
    intro.textContent = item.intro;
    intro.className = "info-intro";
    content.appendChild(intro);
  }

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

  content.style.display = "none";
  box.appendChild(title);
  box.appendChild(content);
  return box;
};

fetchInfo().then(data => {
  const grouped = groupByCategory(data);
  const container = document.getElementById("info-container");
  container.innerHTML = "";

  Object.entries(grouped).forEach(([category, items]) => {
    const catHeader = document.createElement("h2");
    catHeader.className = "category-header";
    catHeader.textContent = category;

    const section = document.createElement("div");
    section.className = "category-section";
    section.style.display = "none";

    items.forEach(item => {
      const box = createInfoBox(item);
      section.appendChild(box);
    });

    catHeader.onclick = () => {
      section.style.display = section.style.display === "none" ? "block" : "none";
    };

    container.appendChild(catHeader);
    container.appendChild(section);
  });
});
