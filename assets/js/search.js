// Wrappa tutto in DOMContentLoaded per garantire che tutti gli elementi siano presenti
(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    const searchInput = document.getElementById("search");
    const filtro = document.getElementById("filtro");
    const searchBtn = document.getElementById("search-btn");
    const container = document.getElementById("articles");
    const status = document.getElementById("status");

    let allArticles = [];
    let isLoaded = false;

    async function loadData() {
      status.innerText = "Caricamento articoli...";

      const response = await fetch("data/articles.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const articles = await response.json();
      if (!Array.isArray(articles)) throw new Error("Formato articoli non valido");
      allArticles = articles;
      isLoaded = true;

      status.innerText = `Caricati ${allArticles.length} articoli`;
    }

    loadData().catch(error => {
      status.innerText = "Errore nel caricamento degli articoli";
      console.error("Errore caricamento articoli:", error);
    });

    // 🔥 RENDER

    function render(list) {
      container.innerHTML = "";

      // Mostra risultati solo se c'è testo nella ricerca
      const value = searchInput.value.trim();
      if (!value) {
        status.innerText = "";
        return;
      }

      status.innerText = `Trovati ${list.length} articoli`;

      if (list.length === 0) {
        container.innerHTML = "<p>Nessun articolo trovato</p>";
        return;
      }

      list.forEach(article => {
        container.innerHTML += `
          <div class="article">
            <h3>
              <a href="article.html?id=${encodeURIComponent(article.id)}">
                ${article.title}
              </a>
            </h3>
            <p>${article.description}</p>
          </div>
        `;
      });

      // Scrolla la pagina in alto alla barra di ricerca se ci sono risultati
      if (list.length > 0) {
        const searchBox = document.querySelector('.search-box');
        if (searchBox) {
          searchBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }

    // 🔥 categoria robusta
    function getCategory(article) {
      if (article.category) return article.category;
      if (!article.tags) return "conflitti";

      if (article.tags.includes("europa")) return "europa";
      if (article.tags.includes("asia")) return "asia";
      if (article.tags.includes("usa")) return "usa";

      return "conflitti";
    }

    // 🔥 SEARCH

    function doSearch() {
      if (!isLoaded) return;

      const value = searchInput.value.toLowerCase().trim();
      const cat = filtro.value;

      // Se il campo ricerca è vuoto, non mostrare risultati
      if (!value) {
        container.innerHTML = "";
        status.innerText = "";
        return;
      }

      let filtered = allArticles;

      // filtro testo
      if (value) {
        filtered = filtered.filter(a =>
          a.title.toLowerCase().includes(value) ||
          a.description.toLowerCase().includes(value) ||
          (a.tags && a.tags.some(t => t.includes(value)))
        );
      }

      // filtro categoria
      if (cat) filtered = filtered.filter(article => getCategory(article) === cat);

      render(filtered);
    }


    // 🔥 EVENTI (puliti)
    searchInput.addEventListener("input", doSearch);
    searchInput.addEventListener("keydown", e => {
      if (e.key === "Enter") doSearch();
    });
    if (searchBtn) {
      searchBtn.addEventListener("click", function () {
        doSearch();
      });
    }
    filtro.addEventListener("change", doSearch);
  });
})();
