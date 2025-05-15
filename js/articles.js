document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("articles-container");

  // Placeholder להמחשה
  const sampleArticles = [
    { title: "איך תמיכה רגשית מצילה חיים", intro: "סיפור מרגש של ילד ששרד את האובדן בעזרת העמותה." },
    { title: "כוחה של קהילה", intro: "איך יצירת רשת תמיכה עזרה לעשרות יתומים להרגיש שוב שייכים." }
  ];

  sampleArticles.forEach(article => {
    const card = document.createElement("div");
    card.className = "article-card";
    card.innerHTML = `<h2>${article.title}</h2><p>${article.intro}</p>`;
    container.appendChild(card);
  });
});
