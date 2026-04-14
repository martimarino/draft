const categorie = ["europa", "asia", "usa", "conflitti"];

Promise.all(
  categorie.map(cat =>
    fetch(`data/${cat}.json`).then(res => res.json())
  )
).then(results => {
  const all = results.flat();

  const container = document.getElementById("breaking");

  all.slice(0, 5).forEach(article => {
    container.innerHTML += `
      <div class="article">
        <h3>
          <a href="article.html?cat=${findCategory(article)}&id=${article.id}">
            ${article.title}
          </a>
        </h3>
        <p>${article.description}</p>
      </div>
    `;
  });
});

function findCategory(article) {
  if (article.tags.includes("europa")) return "europa";
  if (article.tags.includes("asia")) return "asia";
  if (article.tags.includes("usa")) return "usa";
  return "conflitti";
}
