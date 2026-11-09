# diplomacy.geo

Magazine statico in italiano collegato al profilo Instagram @diplomacy.geo:
i post sono il punto di partenza per articoli con contesto, analisi e fonti.
Le pagine sono realizzate con HTML, CSS e JavaScript senza dipendenze di build.

## Avvio in locale

Apri il progetto tramite un server HTTP locale (non direttamente come file),
ad esempio:

```powershell
python -m http.server 8000
```

Poi visita `http://localhost:8000`.

## Gestione degli articoli

`data/articles.json` è la fonte unica per homepage, categorie, ricerca e pagine
articolo. La pagina `search.html` cerca in titoli, sommari, parole chiave e testo
degli articoli e permette di filtrare per categoria. Ogni articolo contiene:

- `id`: identificatore univoco usato negli URL;
- `title`, `description`, `category` e `date` (data dell'articolo, non
  necessariamente la data del post Instagram);
- `image`: percorso dell'immagine dalla root del sito;
- `imageAlt`: descrizione accessibile della fotografia;
- `imageCredit` e `imageCreditUrl` (facoltativi): attribuzione, licenza e pagina
  sorgente dell'immagine, mostrati sotto la foto nell'articolo;
- `tags`: parole chiave per i contenuti correlati e la ricerca;
- `instagramUrl` (facoltativo): link al post Instagram d'origine;
- `sources` (facoltativo): elenco di oggetti con `title` e `url` per le fonti;
- `content` (facoltativo): blocchi `text`, `image` o `map` per il corpo
  dell'articolo. Se manca, viene mostrata la descrizione.

Le categorie supportate sono `europa`, `asia`, `usa` e `conflitti`.
Le immagini incluse sono copie locali ad alta risoluzione da Wikimedia Commons;
crediti e licenze sono salvati per articolo e visibili nella pagina di lettura.

## Pannello redazione

Apri `admin/admin.html` tramite il server locale. Il pannello carica il catalogo,
permette di aggiungere/modificare/rimuovere articoli e accetta l'importazione
di un catalogo JSON. Le bozze restano nel localStorage dello stesso browser.

Per pubblicare, scarica `articles.json`, sostituisci `data/articles.json` con il
file esportato e pubblica il nuovo commit. L'immagine va copiata prima in
`assets/images/` e il suo percorso relativo inserito nel modulo. Questo pannello
non scrive sul repository né pubblica direttamente il sito. Le fonti si
inseriscono una per riga come `Titolo | URL`; il link Instagram è facoltativo e
deve puntare al post specifico, non soltanto al profilo. Per ogni nuova immagine
compila anche descrizione accessibile, credito/licenza e pagina della fonte.

Nel catalogo il pannello segnala, senza impedire salvataggio o esportazione,
articoli sotto le 550 parole, meno di due fonti e metadati fotografici mancanti.
Sono promemoria editoriali: verifica sempre l'attendibilità e la pertinenza delle
fonti prima di pubblicare.