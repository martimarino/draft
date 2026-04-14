const params = new URLSearchParams(window.location.search);
const cat = params.get("cat");
const id = params.get("id");

const title = document.getElementById("title");
const content = document.getElementById("content");

const categorie = ["europa", "asia", "usa", "conflitti"];

Promise.all(
  categorie.map(cat =>
    fetch(`../data/${cat}.json`).then(res => res.json())
  )
).then(results => {
  const allArticles = results.flat();
  const article = allArticles.find(a => a.id === id);
  if (!article) {
    title.innerText = "Articolo non trovato";
    content.innerText = "";
    return;
  }
  title.innerText = article.title;
  content.innerHTML = "";
  if (Array.isArray(article.content)) {
    article.content.forEach(block => {
      if (block.type === "text") {
        content.innerHTML += `<p>${block.value}</p>`;
      }
      if (block.type === "image") {
        content.innerHTML += `<img src="${block.value}" style="width:100%; margin:20px 0;">`;
      }
      if (block.type === "map") {
        content.innerHTML += `<iframe src="${block.value}" width="100%" height="300"></iframe>`;
      }
    });
  } else {
    content.innerText = article.content;
  }
  renderRelated(allArticles, article);
}).catch(err => {
  title.innerText = "Errore caricamento";
  content.innerText = "";
  console.error(err);
});

function renderRelated(all, current) {
  const related = all.filter(a =>
    a.id !== current.id &&
    a.tags && current.tags && a.tags.some(tag => current.tags.includes(tag))
  ).slice(0, 3);

  if (related.length === 0) return;

  const box = document.getElementById("related-articles");
  box.innerHTML = "<h3>Articoli correlati</h3>";

  related.forEach(r => {
    box.innerHTML += `
      <p>
        <a href="article.html?cat=${findCategory(r)}&id=${r.id}">
          ${r.title}
        </a>
      </p>
    `;
  });
}

function findCategory(article) {
  if (article.tags.includes("europa")) return "europa";
  if (article.tags.includes("asia")) return "asia";
  if (article.tags.includes("usa")) return "usa";
  return "conflitti";
}
