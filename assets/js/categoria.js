const params = new URLSearchParams(window.location.search);
const cat = params.get("cat");

const title = document.getElementById("title");
const container = document.getElementById("articles");

title.innerText = cat ? cat.toUpperCase() : "Categoria";

fetch(`data/${cat}.json`)
  .then(res => res.json())
  .then(data => {
    data.forEach(article => {
      container.innerHTML += `
        <div class="article">
          <h3>
            <a href="article.html?cat=${cat}&id=${article.id}">
              ${article.title}
            </a>
          </h3>
          <p>${article.description}</p>
        </div>
      `;
    });
  })
  .catch(err => {
    container.innerHTML = "<p>Errore caricamento articoli</p>";
    console.error(err);
  });
