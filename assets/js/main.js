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
          <div class="article-date">${article.date || ""}</div>
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
