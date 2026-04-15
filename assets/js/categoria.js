const params = new URLSearchParams(window.location.search);
const cat = params.get("cat");

const title = document.getElementById("title");
const container = document.getElementById("articles");

title.innerText = cat ? cat.toUpperCase() : "Categoria";

fetch(`data/${cat}.json`)
  .then(res => res.json())
  .then(data => {
    let html = '';
    data.forEach(article => {
      // Correggi path immagini: se non inizia per 'assets/', aggiungi 'assets/images/'
      let imgPath = article.image || 'assets/images/placeholder.jpg';
      if (imgPath && !imgPath.startsWith('assets/')) {
        imgPath = 'assets/images/' + imgPath;
      }
      html += `
        <div class=\"article-horizontal\">\n\
          <div class=\"article-img-wrap\">\n\
            <img src=\"../${imgPath}\" alt=\"${article.title}\" class=\"article-img\">\n\
          </div>\n\
          <div class=\"article-info\">\n\
            <h3 class=\"article-title\">\n\
              <a href=\"article.html?cat=${cat}&id=${article.id}\">${article.title}</a>\n\
            </h3>\n\
            <div class=\"article-date\">${article.date ? article.date : ''}</div>\n\
            <p class=\"article-desc\">${article.description}</p>\n\
            <a class=\"article-link\" href=\"article.html?cat=${cat}&id=${article.id}\">Leggi articolo &rarr;</a>\n\
          </div>\n\
        </div>\n\
      `;
    });
    container.innerHTML = html;
  })
  .catch(err => {
    container.innerHTML = "<p>Errore caricamento articoli</p>";
    console.error(err);
  });
