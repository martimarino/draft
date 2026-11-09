const params = new URLSearchParams(window.location.search);
const title = document.getElementById("title");
const container = document.getElementById("articles");
const cat = params.get("cat") || container.dataset.category;
const categorie = ["europa", "asia", "usa", "conflitti"];

if (!categorie.includes(cat)) {
  title.textContent = "Categoria non trovata";
  container.textContent = "La categoria richiesta non esiste.";
} else {
  title.textContent = cat.toUpperCase();

  fetch("data/articles.json")
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(articles => {
      if (!Array.isArray(articles)) throw new Error("Formato articoli non valido");
      const filtered = articles.filter(article => article.category === cat);
      if (filtered.length === 0) {
        container.textContent = "Nessun articolo in questa categoria.";
        return;
      }

      container.innerHTML = filtered.map(article => `
        <article class="article-card">
          <a class="article-card-image" href="article.html?id=${encodeURIComponent(article.id)}" tabindex="-1" aria-hidden="true">
            <img src="${article.image}" alt="" class="article-img">
          </a>
          <div class="article-info">
            <span class="category-label">${article.category}</span>
            <div class="article-date">${article.date || ""}</div>
            <h2 class="article-title">
              <a href="article.html?id=${encodeURIComponent(article.id)}">${article.title}</a>
            </h2>
            <p class="article-desc">${article.description}</p>
            <a class="article-link" href="article.html?id=${encodeURIComponent(article.id)}">Leggi l'analisi <span aria-hidden="true">→</span></a>
          </div>
        </article>
      `).join("");
    })
    .catch(error => {
      container.textContent = "Errore nel caricamento degli articoli.";
      console.error("Errore caricamento articoli:", error);
    });
}
