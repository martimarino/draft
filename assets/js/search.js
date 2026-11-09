const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("filtro");
const container = document.getElementById("articles");
const status = document.getElementById("status");

let allArticles = [];

searchForm.addEventListener("submit", event => event.preventDefault());
searchForm.addEventListener("input", renderResults);
searchForm.addEventListener("change", renderResults);

function formatArticleDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || "";
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return value;
  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });
}

function articleSearchText(article) {
  const content = Array.isArray(article.content)
    ? article.content.map(block => block?.value || "").join(" ")
    : article.content || "";
  return [
    article.title,
    article.description,
    ...(Array.isArray(article.tags) ? article.tags : []),
    content
  ].join(" ").toLocaleLowerCase("it");
}

function createArticleCard(article) {
  const card = document.createElement("article");
  card.className = "article-card";

  if (article.image) {
    const imageLink = document.createElement("a");
    imageLink.className = "article-card-image";
    imageLink.href = `article.html?id=${encodeURIComponent(article.id)}`;
    imageLink.tabIndex = -1;
    imageLink.setAttribute("aria-hidden", "true");

    const image = document.createElement("img");
    image.className = "article-img";
    image.src = article.image;
    image.alt = "";
    imageLink.append(image);
    card.append(imageLink);
  }

  const info = document.createElement("div");
  info.className = "article-info";

  const category = document.createElement("span");
  category.className = "category-label";
  category.textContent = article.category || "";

  const date = document.createElement("time");
  date.className = "article-date";
  if (article.date) date.dateTime = article.date;
  date.textContent = article.date ? `Pubblicato il ${formatArticleDate(article.date)}` : "";

  const heading = document.createElement("h2");
  heading.className = "article-title";
  const titleLink = document.createElement("a");
  titleLink.href = `article.html?id=${encodeURIComponent(article.id)}`;
  titleLink.textContent = article.title || "Articolo senza titolo";
  heading.append(titleLink);

  const description = document.createElement("p");
  description.className = "article-desc";
  description.textContent = article.description || "";

  const readLink = document.createElement("a");
  readLink.className = "article-link";
  readLink.href = `article.html?id=${encodeURIComponent(article.id)}`;
  readLink.append(document.createTextNode("Leggi l'analisi "));
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "→";
  readLink.append(arrow);

  info.append(category, date, heading, description, readLink);
  card.append(info);
  return card;
}

function renderResults() {
  const query = searchInput.value.trim().toLocaleLowerCase("it");
  const category = categoryFilter.value;
  const results = allArticles.filter(article => {
    const matchesText = !query || articleSearchText(article).includes(query);
    const matchesCategory = !category || article.category === category;
    return matchesText && matchesCategory;
  });

  container.replaceChildren(...results.map(createArticleCard));
  status.textContent = `${results.length} ${results.length === 1 ? "articolo trovato" : "articoli trovati"}`;

  if (results.length === 0) {
    const empty = document.createElement("p");
    empty.className = "search-empty";
    empty.textContent = "Nessun articolo trovato. Prova un'altra parola chiave o categoria.";
    container.append(empty);
  }
}

async function loadArticles() {
  status.textContent = "Caricamento articoli...";
  try {
    const response = await fetch("data/articles.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const articles = await response.json();
    if (!Array.isArray(articles)) throw new Error("Formato articoli non valido");
    allArticles = articles;

    const params = new URLSearchParams(window.location.search);
    searchInput.value = params.get("q") || "";
    categoryFilter.value = params.get("categoria") || "";
    renderResults();
  } catch (error) {
    status.textContent = "Non è stato possibile caricare gli articoli.";
    console.error("Errore caricamento articoli:", error);
  }
}

loadArticles();
