/* =========================
   Language Manager
   ========================= */

const LANG = {
  storageKey: "site_lang",
  default: "he",
  folder: "local" // שם התיקייה של קבצי ה־JSON
};

function getLang() {
  return localStorage.getItem(LANG.storageKey) || LANG.default;
}

function setLang(lang) {
  localStorage.setItem(LANG.storageKey, lang);
}

function getJsonPath(page, lang) {
  return `${LANG.folder}/${page}.${lang}.json`;
}

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => {
    return acc && acc[key] !== undefined ? acc[key] : undefined;
  }, obj);
}

function applyDirection(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === "he") ? "rtl" : "ltr";
}

function applyText(dict) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const value = getByPath(dict, key);
    if (value === undefined) return;
    el.textContent = value;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    const value = getByPath(dict, key);
    if (value === undefined) return;
    el.setAttribute("placeholder", value);
  });
}

function updateTitle(dict) {
  if (dict?.meta?.title) {
    document.title = dict.meta.title;
  }
}

function updateToggle(lang) {
  const btn = document.getElementById("langToggle");
  if (!btn) return;
  btn.textContent = (lang === "he") ? "EN" : "HE";
}

async function loadLanguage(page, lang) {
  applyDirection(lang);

  const path = getJsonPath(page, lang);
  const res = await fetch(path);

  if (!res.ok) {
    throw new Error(`Language file not found: ${path}`);
  }

  const dict = await res.json();

  updateTitle(dict);
  applyText(dict);
  updateToggle(lang);

  return dict;
}

function initLangSwitcher(page) {
  const btn = document.getElementById("langToggle");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const current = getLang();
    const next = (current === "he") ? "en" : "he";
    setLang(next);
    await loadLanguage(page, next);
  });
}

async function initPageI18n(page) {
  initLangSwitcher(page);
  const lang = getLang();

  try {
    return await loadLanguage(page, lang);
  } catch (err) {
    console.error(err);
  }
}
