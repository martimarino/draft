function addArticle() {
  const section = document.getElementById("section").value;
  const title = document.getElementById("title").value;
  const desc = document.getElementById("desc").value;

  const key = "geo_" + section;

  let articles = JSON.parse(localStorage.getItem(key)) || [];

  articles.push({ title, description: desc });

  localStorage.setItem(key, JSON.stringify(articles));

  alert("Articolo salvato in locale!");
}