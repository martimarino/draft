const container = document.getElementById("news-grid");

fetch("data/articles.json")
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(articles => {
    if (!Array.isArray(articles)) throw new Error("Formato articoli non valido");
    container.innerHTML = articles.map((article, index) => `
      <article class="article-card${index === 0 ? " article-card-featured" : ""}">
        <a class="article-card-image" href="article.html?id=${encodeURIComponent(article.id)}" tabindex="-1" aria-hidden="true">
          <img src="${article.image}" alt="" class="article-img">
        </a>
        <div class="article-info">
          <span class="category-label">${article.category}</span>
          <time class="article-date" datetime="${article.date || ""}">${article.date ? `Data articolo: ${formatArticleDate(article.date)}` : ""}</time>
          <h3 class="article-title">
            <a href="article.html?id=${encodeURIComponent(article.id)}">${article.title}</a>
          </h3>
          <p class="article-desc">${article.description}</p>
          <a class="article-link" href="article.html?id=${encodeURIComponent(article.id)}">Leggi l'analisi <span aria-hidden="true">→</span></a>
        </div>
      </article>
    `).join("");
  })
  .catch(error => {
    container.textContent = "Non è stato possibile caricare gli articoli.";
    console.error("Errore caricamento articoli:", error);
  });

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
