const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const title = document.getElementById("title");
const content = document.getElementById("content");
const date = document.getElementById("date");
const image = document.getElementById("image");
const imageCredit = document.getElementById("image-credit");
const instagramSource = document.getElementById("instagram-source");
const articleSources = document.getElementById("article-sources");
const sourceList = document.getElementById("source-list");

if (!id) {
  showError("Articolo non trovato");
} else {
  fetch("data/articles.json")
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(articles => {
      if (!Array.isArray(articles)) throw new Error("Formato articoli non valido");
      const article = articles.find(item => item.id === id);
      if (!article) {
        showError("Articolo non trovato");
        return;
      }

      title.textContent = article.title;
      document.title = `${article.title} - DIPLOMACY.GEO`;
      if (article.date) {
        date.dateTime = article.date;
        date.textContent = `Data dell'articolo: ${formatArticleDate(article.date)}`;
      }
      if (article.image) {
        image.src = article.image;
        image.alt = article.imageAlt || article.title;
        image.hidden = false;
        if (article.imageCredit && isHttpUrl(article.imageCreditUrl)) {
          const creditLink = document.createElement("a");
          creditLink.href = article.imageCreditUrl;
          creditLink.target = "_blank";
          creditLink.rel = "noopener noreferrer";
          creditLink.textContent = article.imageCredit;
          imageCredit.append(creditLink);
          imageCredit.hidden = false;
        }
      }
      if (isHttpUrl(article.instagramUrl)) {
        instagramSource.href = article.instagramUrl;
        instagramSource.hidden = false;
      }

      if (Array.isArray(article.content)) {
        article.content.forEach(block => renderBlock(block));
      } else {
        const paragraph = document.createElement("p");
        paragraph.textContent = article.content || article.description || "";
        content.append(paragraph);
      }
      renderSources(article.sources);
      renderRelated(articles, article);
    })
    .catch(error => {
      showError("Errore nel caricamento dell'articolo");
      console.error("Errore caricamento articolo:", error);
    });
}

function showError(message) {
  title.textContent = message;
  content.textContent = "";
}

function formatArticleDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || "";
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return value;
  return parsed.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });
}

function renderBlock(block) {
  if (block.type === "text") {
    const paragraph = document.createElement("p");
    paragraph.textContent = block.value;
    content.append(paragraph);
  } else if (block.type === "image") {
    const image = document.createElement("img");
    image.src = block.value;
    image.alt = "";
    content.append(image);
  } else if (block.type === "map") {
    const frame = document.createElement("iframe");
    frame.src = block.value;
    frame.title = "Mappa relativa all'articolo";
    frame.loading = "lazy";
    content.append(frame);
  }
}

function isHttpUrl(value) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function renderSources(sources) {
  if (!Array.isArray(sources)) return;
  const validSources = sources.filter(source =>
    source && typeof source.title === "string" && source.title.trim() && isHttpUrl(source.url)
  );
  if (validSources.length === 0) return;

  validSources.forEach(source => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = source.title;
    item.append(link);
    sourceList.append(item);
  });
  articleSources.hidden = false;
}

function renderRelated(all, current) {
  const related = all.filter(a =>
    a.id !== current.id &&
    a.tags && current.tags && a.tags.some(tag => current.tags.includes(tag))
  ).slice(0, 3);

  if (related.length === 0) return;

  const box = document.getElementById("related-articles");
  const heading = document.createElement("h2");
  heading.textContent = "Articoli correlati";
  box.append(heading);

  related.forEach(r => {
    const paragraph = document.createElement("p");
    const link = document.createElement("a");
    link.href = `article.html?id=${encodeURIComponent(r.id)}`;
    link.textContent = r.title;
    paragraph.append(link);
    box.append(paragraph);
  });
}
