const categories = ["europa", "asia", "usa", "conflitti"];
const storageKey = "diplomacy.geo.admin.articles.v3";
const form = document.getElementById("article-form");
const titleInput = document.getElementById("title");
const status = document.getElementById("status");
const list = document.getElementById("article-list");
const fileInput = document.getElementById("import-file");
const count = document.getElementById("article-count");
const formHeading = document.getElementById("form-heading");
const saveButton = document.getElementById("save-button");
const cancelEditButton = document.getElementById("cancel-edit");

let articles = [];
let editingId = null;

function getLocalDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function showStatus(message, type = "info") {
  status.textContent = message;
  status.dataset.type = type;
}

function validateCatalog(value) {
  if (!Array.isArray(value)) throw new Error("Il JSON deve contenere un elenco di articoli.");

  const ids = new Set();
  value.forEach((article, index) => {
    const row = index + 1;
    if (!article || typeof article !== "object" || Array.isArray(article)) {
      throw new Error(`L’elemento ${row} non è un articolo valido.`);
    }
    if (typeof article.id !== "string" || !article.id.trim() ||
        article.id.trim() !== article.id || ids.has(article.id)) {
      throw new Error(`ID mancante o duplicato nell’articolo ${row}.`);
    }
    if (typeof article.title !== "string" || !article.title.trim() ||
        typeof article.description !== "string" || !article.description.trim()) {
      throw new Error(`Titolo o sommario mancante nell’articolo ${row}.`);
    }
    if (!categories.includes(article.category)) {
      throw new Error(`Categoria non valida nell’articolo ${row}.`);
    }
    if (article.date !== undefined && typeof article.date !== "string") {
      throw new Error(`La data dell’articolo ${row} non è valida.`);
    }
    if (article.image !== undefined && typeof article.image !== "string") {
      throw new Error(`Il percorso immagine dell’articolo ${row} non è valido.`);
    }
    if (article.imageAlt !== undefined && typeof article.imageAlt !== "string") {
      throw new Error(`La descrizione dell'immagine dell’articolo ${row} non è valida.`);
    }
    if (article.imageCredit !== undefined && typeof article.imageCredit !== "string") {
      throw new Error(`Il credito fotografico dell’articolo ${row} non è valido.`);
    }
    if (article.imageCreditUrl && !isHttpUrl(article.imageCreditUrl)) {
      throw new Error(`Il link del credito fotografico dell’articolo ${row} non è valido.`);
    }
    if (article.instagramUrl !== undefined && !isHttpUrl(article.instagramUrl)) {
      throw new Error(`Il link Instagram dell’articolo ${row} non è valido.`);
    }
    if (article.tags !== undefined &&
        (!Array.isArray(article.tags) || article.tags.some(tag => typeof tag !== "string"))) {
      throw new Error(`Le parole chiave dell’articolo ${row} devono essere un elenco.`);
    }
    if (article.sources !== undefined &&
        (!Array.isArray(article.sources) || article.sources.some(source =>
          !source || typeof source.title !== "string" || !source.title.trim() || !isHttpUrl(source.url)
        ))) {
      throw new Error(`Le fonti dell’articolo ${row} non sono valide.`);
    }
    if (article.content !== undefined &&
        typeof article.content !== "string" &&
        !Array.isArray(article.content)) {
      throw new Error(`Il testo dell’articolo ${row} non è valido.`);
    }
    if (Array.isArray(article.content) && article.content.some(block =>
        !block || !["text", "image", "map"].includes(block.type) || typeof block.value !== "string"
    )) {
        throw new Error(`I blocchi di testo dell’articolo ${row} non sono validi.`);
    }
    ids.add(article.id);
  });
  return value;
}

function saveDrafts() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(articles));
    renderArticles();
    return true;
  } catch (error) {
    showStatus("Impossibile salvare le bozze in questo browser.", "error");
    console.error("Errore salvataggio bozze:", error);
    return false;
  }
}

function renderArticles() {
  count.textContent = `${articles.length} ${articles.length === 1 ? "articolo" : "articoli"}`;
  list.replaceChildren();

  if (articles.length === 0) {
    const empty = document.createElement("p");
    empty.className = "admin-empty";
    empty.textContent = "Il catalogo è vuoto. Aggiungi un articolo o importa un file JSON.";
    list.append(empty);
    return;
  }

  articles.forEach(article => {
    const item = document.createElement("article");
    item.className = "admin-article-item";

    const details = document.createElement("div");
    details.className = "admin-article-details";
    const heading = document.createElement("h3");
    heading.textContent = article.title;
    const meta = document.createElement("p");
    meta.textContent = `${article.category} · ${article.date ? formatArticleDate(article.date) : "Data non impostata"}`;
    details.append(heading, meta);

    const warnings = getQualityWarnings(article);
    if (warnings.length > 0) {
      const warningList = document.createElement("ul");
      warningList.className = "admin-quality-notes";
      warnings.forEach(warning => {
        const note = document.createElement("li");
        note.textContent = warning;
        warningList.append(note);
      });
      details.append(warningList);
    }

    const actions = document.createElement("div");
    actions.className = "admin-item-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "admin-text-button";
    edit.dataset.action = "edit";
    edit.dataset.id = article.id;
    edit.textContent = "Modifica";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "admin-text-button admin-remove-button";
    remove.dataset.action = "remove";
    remove.dataset.id = article.id;
    remove.textContent = "Rimuovi";
    actions.append(edit, remove);

    item.append(details, actions);
    list.append(item);
  });
}

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

function getQualityWarnings(article) {
  const warnings = [];
  const wordCount = bodyToText(article.content).trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 550) warnings.push(`Testo breve: ${wordCount} parole (obiettivo: almeno 550).`);
  if (!Array.isArray(article.sources) || article.sources.length < 2) {
    warnings.push("Aggiungi almeno 2 fonti verificabili.");
  }
  if (article.image && !article.imageAlt?.trim()) warnings.push("Manca il testo alternativo dell'immagine.");
  if (article.image && (!article.imageCredit?.trim() || !isHttpUrl(article.imageCreditUrl))) {
    warnings.push("Completa credito, licenza e link alla fonte della foto.");
  }
  return warnings;
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "articolo";
}

function isHttpUrl(value) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function createUniqueId(title, currentId = null) {
  const base = slugify(title);
  let candidate = base;
  let suffix = 2;
  while (articles.some(article => article.id === candidate && article.id !== currentId)) {
    candidate = `${base}-${suffix++}`;
  }
  return candidate;
}

function bodyToText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter(block => block?.type === "text" && typeof block.value === "string")
    .map(block => block.value)
    .join("\n\n");
}

function resetForm() {
  form.reset();
  document.getElementById("date").value = getLocalDate();
  editingId = null;
  formHeading.textContent = "Nuovo articolo";
  saveButton.textContent = "Aggiungi al catalogo";
  cancelEditButton.hidden = true;
}

function beginEdit(id) {
  const article = articles.find(item => item.id === id);
  if (!article) return;

  editingId = id;
  titleInput.value = article.title;
  form.elements.description.value = article.description;
  form.elements.category.value = article.category;
  form.elements.date.value = article.date || "";
  form.elements.image.value = article.image || "";
  form.elements.imageAlt.value = article.imageAlt || "";
  form.elements.imageCredit.value = article.imageCredit || "";
  form.elements.imageCreditUrl.value = article.imageCreditUrl || "";
  form.elements.tags.value = (article.tags || []).join(", ");
  form.elements.instagramUrl.value = article.instagramUrl || "";
  form.elements.sources.value = (article.sources || [])
    .map(source => `${source.title} | ${source.url}`)
    .join("\n");
  form.elements.body.value = bodyToText(article.content);
  formHeading.textContent = "Modifica articolo";
  saveButton.textContent = "Salva modifiche";
  cancelEditButton.hidden = false;
  titleInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function createContent(text) {
  return text
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean)
    .map(value => ({ type: "text", value }));
}

function parseSources(value) {
  return value
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const separator = line.indexOf("|");
      if (separator < 1) throw new Error(`Formato fonte non valido alla riga ${index + 1}.`);
      const source = {
        title: line.slice(0, separator).trim(),
        url: line.slice(separator + 1).trim()
      };
      if (!source.title || !isHttpUrl(source.url)) {
        throw new Error(`Titolo o URL non valido alla riga ${index + 1}.`);
      }
      return source;
    });
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const previous = articles.find(article => article.id === editingId);
  const title = titleInput.value.trim();
  const description = form.elements.description.value.trim();
  const body = form.elements.body.value.trim();
  const tags = form.elements.tags.value
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean);
  let sources;
  try {
    sources = parseSources(form.elements.sources.value);
  } catch (error) {
    showStatus(error.message, "error");
    return;
  }

  const article = {
    id: editingId || createUniqueId(title),
    title,
    description,
    category: form.elements.category.value,
    date: form.elements.date.value,
    image: form.elements.image.value.trim(),
    imageAlt: form.elements.imageAlt.value.trim(),
    imageCredit: form.elements.imageCredit.value.trim(),
    imageCreditUrl: form.elements.imageCreditUrl.value.trim(),
    tags,
    sources
  };
  const instagramUrl = form.elements.instagramUrl.value.trim();
  if (instagramUrl) {
    if (!isHttpUrl(instagramUrl)) {
      showStatus("Il link Instagram deve essere un URL HTTP o HTTPS valido.", "error");
      return;
    }
    article.instagramUrl = instagramUrl;
  }

  if (body) {
    article.content = createContent(body);
  } else if (previous?.content !== undefined) {
    article.content = previous.content;
  }
  if (previous) {
    articles = articles.map(item => item.id === editingId ? article : item);
  } else {
    articles = [article, ...articles];
  }

  if (!saveDrafts()) return;
  showStatus(previous ? "Modifiche salvate nelle bozze." : "Articolo aggiunto alle bozze.", "success");
  resetForm();
});

cancelEditButton.addEventListener("click", () => {
  resetForm();
  showStatus("Modifica annullata.", "info");
});

list.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  if (button.dataset.action === "edit") {
    beginEdit(button.dataset.id);
  } else if (button.dataset.action === "remove") {
    const article = articles.find(item => item.id === button.dataset.id);
    if (!article || !window.confirm(`Rimuovere "${article.title}" dal catalogo?`)) return;
    articles = articles.filter(item => item.id !== button.dataset.id);
    if (!saveDrafts()) return;
    if (editingId === button.dataset.id) resetForm();
    showStatus("Articolo rimosso dalle bozze.", "success");
  }
});

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  try {
    const imported = validateCatalog(JSON.parse(await file.text()));
    if (!window.confirm(`Sostituire il catalogo corrente con i ${imported.length} articoli del file?`)) {
      fileInput.value = "";
      return;
    }
    articles = imported;
    resetForm();
    if (saveDrafts()) showStatus(`Importati ${articles.length} articoli.`, "success");
  } catch (error) {
    showStatus(`Importazione non riuscita: ${error.message}`, "error");
  } finally {
    fileInput.value = "";
  }
});

document.getElementById("export-button").addEventListener("click", () => {
  try {
    validateCatalog(articles);
    const blob = new Blob([`${JSON.stringify(articles, null, 2)}\n`], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "articles.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showStatus("Catalogo esportato. Sostituisci data/articles.json e pubblica il sito.", "success");
  } catch (error) {
    showStatus(`Esportazione non riuscita: ${error.message}`, "error");
  }
});

async function initialize() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      articles = validateCatalog(JSON.parse(saved));
    } else {
      const response = await fetch("../data/articles.json");
      if (!response.ok) throw new Error(`Caricamento catalogo non riuscito (HTTP ${response.status}).`);
      articles = validateCatalog(await response.json());
      localStorage.setItem(storageKey, JSON.stringify(articles));
    }
    renderArticles();
    showStatus("Bozze salvate solo in questo browser. Esporta il JSON per pubblicarle.", "info");
  } catch (error) {
    showStatus(`Impossibile aprire il catalogo: ${error.message}`, "error");
    console.error("Errore inizializzazione redazione:", error);
  }
}

document.getElementById("date").value = getLocalDate();
initialize();
