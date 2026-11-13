# Smart Stream : plateforme web IPTV / TV en direct

Application web front-end qui affiche une liste de chaînes TV (groupées par pays), les récupère depuis une API MockAPI, permet de chercher une chaîne et lit son flux vidéo dans une zone de prévisualisation.

Ce README est écrit sous forme de **questions / réponses** pour comprendre chaque technologie, chaque fonction et chaque élément du code.

---

## Sommaire

1. [Vue d'ensemble](#1-vue-densemble)
2. [Technologies utilisées](#2-technologies-utilisées)
3. [Structure du projet](#3-structure-du-projet)
4. [Les données (data.json / MockAPI)](#4-les-données-datajson--mockapi)
5. [Les fichiers JavaScript, fonction par fonction](#5-les-fichiers-javascript-fonction-par-fonction)
6. [Le DOM : méthodes et propriétés utilisées](#6-le-dom--méthodes-et-propriétés-utilisées)
7. [Le JavaScript : notions utilisées](#7-le-javascript--notions-utilisées)
8. [Le HTML : balises et attributs](#8-le-html--balises-et-attributs)
9. [Tailwind CSS : classes utilisées](#9-tailwind-css--classes-utilisées)
10. [Gestion des états : chargement et erreur](#10-gestion-des-états--chargement-et-erreur)
11. [Git et GitHub](#11-git-et-github)
12. [Erreurs fréquentes et débogage](#12-erreurs-fréquentes-et-débogage)

---

## 1. Vue d'ensemble

### Q : Que fait l'application ?

1. Au chargement, elle récupère toutes les chaînes depuis MockAPI (avec `fetch`).
2. Pendant l'attente, elle affiche un **spinner** ; en cas d'échec, un **message d'erreur** avec un bouton « Réessayer ».
3. L'utilisateur clique sur un **pays** : la liste de ses chaînes apparaît dans la sidebar.
4. Il clique sur une **chaîne** : la zone de droite affiche le flux vidéo, le nom, le numéro, la catégorie et le programme en cours.
5. Il tape dans la **barre de recherche** : la liste se filtre instantanément par nom ou par numéro.

### Q : Quelle est la logique générale du code ?

Le projet est découpé en couches :

| Couche | Fichier | Rôle |
|---|---|---|
| Services | `services/api.js` | parler à l'API (récupérer les données) |
| Affichage (UI) | `js/ui.js` | construire et mettre à jour l'écran |
| Recherche | `js/search.js` | filtrer les chaînes quand on tape |
| Chef d'orchestre | `js/app.js` | charger les données et brancher les clics |

Chaque fichier a **un seul travail**. C'est ce qu'on appelle une architecture modulaire.

### Q : Quel est le chemin d'une donnée, de l'API à l'écran ?

```
MockAPI --fetch--> getData() --> app.js (tabchaines) --> afficherChaines() --> HTML dans #channels-list
                                        |
                                        +--> searchChannels() --> afficherChaines(résultats)
```

---

## 2. Technologies utilisées

### Q : Quelles technologies sont utilisées, et pour quoi faire ?

| Technologie | Rôle dans le projet |
|---|---|
| **HTML5** | structure de la page (aside, main, header, section, button, video...) |
| **Tailwind CSS v4** (CDN navigateur) | mise en forme avec des classes utilitaires, sans écrire de CSS |
| **JavaScript ES6+** | logique : données, événements, affichage |
| **Modules ES6** (`import` / `export`) | séparer le code en plusieurs fichiers |
| **Fetch API** | envoyer des requêtes HTTP vers MockAPI |
| **MockAPI** | faux serveur qui héberge la ressource `iptv` (nos chaînes) |
| **JSON** | format des données échangées |
| **HLS / hls.js** | lire les flux vidéo `.m3u8` dans le navigateur |
| **Font Awesome 6** | bibliothèque d'icônes (chargée par CDN) |
| **Git / GitHub** | versionner le code, branches, Pull Requests |
| **Figma** | maquette de l'interface |

### Q : Qu'est-ce que Tailwind CSS ?

Un framework CSS « utility-first » : au lieu d'écrire du CSS dans un fichier, tu écris des **petites classes** directement dans le HTML. Exemple : `rounded-xl` arrondit les coins, `p-4` ajoute un espace intérieur.

Il est chargé ici par cette ligne :

```html
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
```

### Q : Qu'est-ce que MockAPI ?

Un service en ligne qui crée une **fausse API REST** à partir de tes données JSON. On l'utilise comme serveur de test : on obtient une URL (endpoint) qui renvoie la liste des chaînes.

### Q : Qu'est-ce qu'une API REST et que sont les codes HTTP ?

Une API REST répond à des requêtes HTTP avec des données (souvent JSON). Les codes de réponse indiquent le résultat :

| Code | Signification |
|---|---|
| `200` | succès |
| `404` | ressource introuvable (mauvaise URL) |
| `500` | erreur du serveur |

### Q : Pourquoi hls.js ?

Les flux IPTV sont en format **HLS** (fichier `.m3u8`). Safari le lit nativement, mais Chrome, Firefox et Edge non : la librairie `hls.js` fait la traduction. Elle est chargée dans le `<head>` :

```html
<script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.17"></script>
```

---

## 3. Structure du projet

### Q : Comment sont organisés les fichiers ?

```
smart-stream-tv/
├── index.html
├── css/
│   └── style.css
├── img/
│   └── logo.jpg
├── js/
│   ├── app.js
│   ├── ui.js
│   └── search.js
├── services/
│   └── api.js
└── README.md
```

### Q : Pourquoi `type="module"` sur la balise script ?

```html
<script type="module" src="js/app.js"></script>
```

Sans lui, `import` et `export` ne fonctionnent pas. Avec lui, `app.js` peut importer les autres fichiers. Un module a deux particularités : il est exécuté **après** le chargement du HTML, et il doit être servi par un serveur (extension *Live Server* de VS Code), pas ouvert en double-cliquant le fichier.

---

## 4. Les données (data.json / MockAPI)

### Q : À quoi ressemble une chaîne ?

```json
{
  "id": "1",
  "channelNumber": "1001",
  "countryCode": "MA",
  "name": "MA - AL AOULA FHD",
  "category": "GENERAL",
  "logo": "https://placehold.co/60x60?text=MA+1",
  "previewImage": "https://placehold.co/800x450?text=Al+Aoula",
  "streamUrl": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  "isLive": true,
  "epg": {
    "currentProgram": "Live Broadcast from Morocco",
    "startTime": "20:00",
    "endTime": "21:00",
    "progressPercentage": 16
  }
}
```

### Q : Que signifie chaque champ ?

| Champ | Type | Utilisation |
|---|---|---|
| `id` | texte | identifiant unique de la chaîne |
| `channelNumber` | texte | numéro affiché et utilisé dans la recherche |
| `countryCode` | texte | code pays (`MA`, `FR`, `GR`, `ES`) pour filtrer au clic sur un pays |
| `name` | texte | nom affiché, utilisé dans la recherche |
| `category` | texte | badge de catégorie |
| `logo` | URL | petite image dans la liste |
| `previewImage` | URL | image d'aperçu (poster de la vidéo) |
| `streamUrl` | URL | lien du flux `.m3u8` lu par hls.js |
| `isLive` | booléen | affiche le badge LIVE si `true` |
| `epg` | objet | guide des programmes (voir ci-dessous) |

### Q : Qu'est-ce que `epg` ?

*Electronic Program Guide* : un **objet à l'intérieur de la chaîne**. Pour lire ses valeurs, on passe par lui :

```javascript
chaine.epg.currentProgram   // correct
chaine.currentProgram       // undefined : n'existe pas à ce niveau
```

### Q : Comment l'API est-elle appelée ?

Avec une seule URL (endpoint) :

```
https://6af43b2c55a1de7dcf03be12.mockapi.io/api/v1/iptv
```

Un `GET` sur cette URL renvoie un tableau JSON contenant toutes les chaînes.

---

## 5. Les fichiers JavaScript, fonction par fonction

### `services/api.js`

#### Q : Que fait `getData()` ?

```javascript
const dataApi = "https://6af43b2c55a1de7dcf03be12.mockapi.io/api/v1/iptv";

export async function getData() {
    const res = await fetch(dataApi);

    if (!res.ok) {
        throw new Error(`HTTP Error : ${res.status}`);
    }

    return await res.json();
}
```

| | |
|---|---|
| **Paramètre** | aucun |
| **Retourne** | une promesse qui donne un tableau de chaînes |
| **Rôle** | envoyer la requête, vérifier la réponse, convertir en objet JS |
| **En cas d'échec** | lance une erreur, attrapée par `init()` dans `app.js` |

Étapes :
1. `fetch(dataApi)` envoie la requête et attend la réponse.
2. `res.ok` vaut `true` pour les codes 200 à 299. Sinon on lance une erreur.
3. `res.json()` transforme le texte JSON en tableau JavaScript.

#### Q : Pourquoi `export` ?

Pour que d'autres fichiers puissent faire `import { getData } from "../services/api.js"`. Sans `export`, la fonction reste privée à son fichier.

---

### `js/app.js`

#### Q : Que fait `init()` ?

```javascript
async function init() {
    loading.classList.remove("hidden");
    error.classList.add("hidden");

    try {
        tabchaines = await getData();
        searchChannels(tabchaines);
    } catch (erreur) {
        console.error("Erreur de chargement :", erreur);
        error.classList.remove("hidden");
        error.classList.add("flex");
    } finally {
        loading.classList.add("hidden");
    }
}
```

| | |
|---|---|
| **Paramètre** | aucun |
| **Rôle** | charger les données, gérer les états chargement / succès / erreur |
| **Appelée** | au démarrage et au clic sur « Réessayer » |

#### Q : Que contient la variable `tabchaines` ?

Le tableau de **toutes** les chaînes, rempli une seule fois par `init()`. Elle est ensuite donnée à `afficherChaines()` et à `searchChannels()`. C'est la « source de vérité » des données.

#### Q : Comment les boutons pays fonctionnent-ils ?

```javascript
document.querySelectorAll(".btn-pays").forEach(function (bouton) {
    bouton.addEventListener("click", function () {
        afficherChaines(tabchaines, bouton.dataset.country);
    });
});
```

Chaque bouton du HTML porte un attribut `data-country="MA"` (ou `FR`, `GR`, `ES`). Au clic, on lit cette valeur avec `bouton.dataset.country` et on la passe à `afficherChaines`.

---

### `js/ui.js`

#### Q : Que fait `afficherChaines(chaines, codePays)` ?

| | |
|---|---|
| **Paramètre `chaines`** | tableau de chaînes à traiter |
| **Paramètre `codePays`** | code pays facultatif (`"MA"`...) |
| **Retourne** | rien (elle modifie la page) |
| **Rôle** | filtrer, construire la liste HTML, afficher la 1ʳᵉ chaîne, brancher les clics |

Ses 6 étapes :
1. **Filtrer** par pays, seulement si `codePays` est fourni (sinon on garde tout, utile pour la recherche).
2. **Construire** une chaîne de texte HTML avec `forEach` et un *template literal*.
3. **Afficher** un message « Aucune chaîne trouvée » si la liste est vide.
4. **Injecter** le HTML dans `#channels-list` avec `innerHTML`.
5. **Afficher par défaut** la première chaîne.
6. **Brancher** un écouteur de clic sur chaque `.channel`.

#### Q : Que fait `showChannelInfo(chaine)` ?

Fonction interne à `afficherChaines`. Elle remplit la zone de droite avec **une** chaîne :

```javascript
function showChannelInfo(chaine) {
    playStream(chaine.streamUrl);

    channelName.textContent     = chaine.name;
    channelCountry.textContent  = chaine.countryCode;
    channelNumber.textContent   = chaine.channelNumber;
    channelCategory.textContent = chaine.category;

    channelProgram.textContent  = chaine.epg.currentProgram;
    channelTime.textContent     = chaine.epg.startTime + " - " + chaine.epg.endTime;
    channelProgress.textContent = chaine.epg.progressPercentage + "%";

    channelLive.classList.toggle("hidden", !chaine.isLive);
}
```

Elle est appelée à deux endroits (chaîne par défaut et clic) : c'est pour cela qu'elle est écrite une seule fois, dans une fonction.

#### Q : Comment le clic sur une chaîne retrouve-t-il la bonne chaîne ?

Les boutons sont créés **dans le même ordre** que le tableau. Le bouton n° `index` correspond donc à `chainesPays[index]` :

```javascript
const boutons = liste.querySelectorAll(".channel");

boutons.forEach(function (bouton, index) {
    bouton.addEventListener("click", function () {
        showChannelInfo(chainesPays[index]);
    });
});
```

#### Q : Que fait `playStream(url)` ?

| | |
|---|---|
| **Paramètre** | `url` : lien du flux `.m3u8` |
| **Rôle** | lire le flux dans `<video id="player">` |

Logique :
1. Si une lecture HLS précédente existe, on la détruit (`hls.destroy()`).
2. Si le navigateur lit le HLS nativement (Safari), on met `video.src = url`.
3. Sinon, si `hls.js` est disponible, on crée `new Hls()`, on charge l'URL (`loadSource`) puis on l'attache à la vidéo (`attachMedia`).
4. On lance `video.play()`. La vidéo est `muted`, car les navigateurs bloquent la lecture automatique avec du son.

---

### `js/search.js`

#### Q : Que fait `searchChannels(channels)` ?

```javascript
export function searchChannels(channels) {
    const search = document.getElementById("search");

    search.addEventListener("input", function (e) {
        const texte = e.target.value.toUpperCase();

        const filtered = channels.filter(function (chaine) {
            return (chaine.name + " " + chaine.channelNumber).toUpperCase().includes(texte);
        });

        afficherChaines(filtered);
    });
}
```

| | |
|---|---|
| **Paramètre** | `channels` : tableau de toutes les chaînes |
| **Rôle** | à chaque lettre tapée, filtrer et réafficher |

#### Q : Pourquoi `toUpperCase()` ?

Pour ignorer les majuscules et minuscules : « al aoula », « AL AOULA » et « Al Aoula » donnent le même résultat.

#### Q : Pourquoi `" "` entre le nom et le numéro ?

Pour ne pas fusionner les deux textes. Sans l'espace, `"FHD"` et `"1001"` deviendraient `"FHD1001"`, ce qui peut créer de fausses correspondances.

#### Q : Pourquoi passer `channels` en paramètre plutôt qu'appeler `getData()` ?

Appeler `getData()` à chaque lettre ferait **une requête réseau par touche** : lent et inutile. Les données sont chargées une seule fois, puis réutilisées.

---

## 6. Le DOM : méthodes et propriétés utilisées

### Q : Qu'est-ce que le DOM ?

*Document Object Model* : la représentation de ta page HTML sous forme d'objets que JavaScript peut lire et modifier. `document` est l'objet racine.

### Q : Comment sélectionner des éléments ?

| Méthode | Retourne | Exemple |
|---|---|---|
| `document.getElementById("x")` | **un** élément (par son `id`) | `getElementById("search")` |
| `document.querySelector(".x")` | le **premier** élément correspondant | `querySelector("#search")` |
| `document.querySelectorAll(".x")` | **tous** les éléments (liste) | `querySelectorAll(".btn-pays")` |
| `element.querySelectorAll(".x")` | tous ceux **à l'intérieur** de `element` | `liste.querySelectorAll(".channel")` |

Si l'élément n'existe pas, `getElementById` renvoie `null` : c'est la cause n° 1 des erreurs.

### Q : Comment modifier le contenu ?

| Propriété | Effet |
|---|---|
| `element.textContent = "..."` | remplace le **texte** (sûr, le HTML n'est pas interprété) |
| `element.innerHTML = "..."` | remplace par du **HTML** (utilisé pour la liste de chaînes) |

### Q : Comment modifier les classes ?

| Méthode | Effet |
|---|---|
| `classList.add("hidden")` | ajoute une classe |
| `classList.remove("hidden")` | enlève une classe |
| `classList.toggle("hidden", condition)` | ajoute si `condition` est vraie, enlève sinon |

Exemple : `channelLive.classList.toggle("hidden", !chaine.isLive)` cache le badge LIVE quand la chaîne n'est pas en direct.

### Q : Comment lire des données dans le HTML ?

Avec `dataset` : un attribut `data-country="MA"` devient `element.dataset.country`. Le texte après `data-` devient le nom de la propriété.

### Q : Comment réagir à un événement ?

```javascript
element.addEventListener("click", function () { ... });
```

| Événement | Quand |
|---|---|
| `click` | clic sur un élément |
| `input` | à chaque modification d'un champ texte (idéal pour la recherche instantanée) |

L'objet `e` donné à la fonction contient les infos de l'événement : `e.target.value` est le texte actuel du champ.

### Q : Comment modifier le style directement ?

`element.style.width = "50%"` écrit un style en ligne (utile pour une barre de progression dont la valeur vient des données).

---

## 7. Le JavaScript : notions utilisées

### Q : Quelle différence entre `const` et `let` ?

- `const` : la variable ne sera pas réaffectée (`const liste = ...`).
- `let` : la variable peut changer (`let tabchaines = []`, `let html = ""`).

### Q : Que font `async` et `await` ?

- `async` devant une fonction : elle renvoie une promesse et peut utiliser `await`.
- `await` : attend la fin d'une opération lente (réseau) avant de continuer, sans bloquer la page.

```javascript
tabchaines = await getData();   // on continue seulement quand les données sont là
```

### Q : À quoi servent `try`, `catch` et `finally` ?

```javascript
try {
    // code qui peut échouer (la requête)
} catch (erreur) {
    // ce qu'on fait si ça échoue (afficher l'erreur)
} finally {
    // s'exécute TOUJOURS (cacher le spinner)
}
```

### Q : Que fait `throw new Error(...)` ?

Il **provoque volontairement une erreur**. Dans `getData()`, il signale un code HTTP incorrect (404, 500) pour que le `catch` de `init()` l'attrape.

### Q : Comment fonctionnent `map`, `filter`, `find`, `forEach` ?

| Méthode | Rôle | Retourne |
|---|---|---|
| `filter(fn)` | garde les éléments pour lesquels `fn` renvoie `true` | un nouveau tableau |
| `find(fn)` | trouve le **premier** élément correspondant | un élément (ou `undefined`) |
| `map(fn)` | transforme chaque élément | un nouveau tableau |
| `forEach(fn)` | exécute `fn` pour chaque élément | rien |

Dans ce projet : `filter` (pays et recherche), `forEach` (construire la liste et brancher les clics).

### Q : Qu'est-ce qu'un template literal ?

Un texte entre **backticks** (`` ` ``) qui accepte `${...}` pour insérer des valeurs et qui peut s'écrire sur plusieurs lignes :

```javascript
html += `<p class="text-sm">${chaine.name}</p>`;
```

### Q : Que font `includes()` et `toUpperCase()` ?

- `"AL AOULA".includes("AOU")` renvoie `true` : le texte contient-il cette partie ?
- `"abc".toUpperCase()` renvoie `"ABC"`.

### Q : Que sont `import` et `export` ?

- `export` : rend une fonction disponible pour les autres fichiers.
- `import { x } from "./fichier.js"` : utilise cette fonction ailleurs. Le nom entre accolades doit être **identique**.

### Q : Que fait `console.log()` / `console.error()` ?

Affiche un message dans la console (F12). `console.error` l'affiche en rouge. C'est l'outil de base pour déboguer.

### Q : Que signifie `if (!bouton) return;` ?

« Si `bouton` n'existe pas, arrête la fonction ici. » C'est une **garde** : elle évite de continuer avec une valeur vide.

---

## 8. Le HTML : balises et attributs

### Q : Quelles balises structurent la page ?

| Balise | Rôle |
|---|---|
| `<aside>` | panneau latéral (logo, recherche, pays, liste des chaînes) |
| `<main>` | zone principale de droite |
| `<header>` | en-tête de la zone principale |
| `<section>` | bloc de contenu (vidéo et infos) |
| `<button>` | élément cliquable (pays, retour, réessayer) |
| `<input>` | champ de recherche |
| `<video>` | lecteur vidéo |
| `<img>` | logo et images |
| `<svg>` | icônes dessinées (flèches) |
| `<h1>` | titre principal (nom de la chaîne) |
| `<p>`, `<span>`, `<div>` | texte et conteneurs |

### Q : Quels `id` le JavaScript utilise-t-il ?

| `id` | Élément | Rôle |
|---|---|---|
| `search` | `<input>` | champ de recherche |
| `channels-list` | `<div>` | zone où la liste des chaînes est injectée |
| `player` | `<video>` | lecteur vidéo |
| `channel-name` | `<h1>` | nom de la chaîne |
| `channel-number` | `<span>` | numéro de la chaîne |
| `channel-category` | `<span>` | badge de catégorie |
| `channel-country` | `<span>` | code pays |
| `channel-live` | `<span>` | badge LIVE |
| `channel-program` | `<p>` | programme en cours |
| `channel-time` | `<span>` | horaire début - fin |
| `channel-progress` | `<span>` | pourcentage de progression |
| `loading` | `<div>` | écran de chargement |
| `error` | `<div>` | écran d'erreur |
| `retry` | `<button>` | bouton « Réessayer » |

> Un `id` doit être **unique** dans toute la page. Deux éléments avec le même `id` empêchent JS de fonctionner correctement.

### Q : Quelles classes servent de repères au JavaScript ?

| Classe | Utilisation |
|---|---|
| `btn-pays` | sélectionner les boutons de pays |
| `channel` | sélectionner chaque chaîne de la liste |

### Q : Quels attributs sont importants ?

| Attribut | Rôle |
|---|---|
| `data-country="MA"` | stocke le code pays dans le bouton |
| `type="button"` | évite qu'un bouton soit pris pour un bouton de formulaire |
| `placeholder` | texte d'aide dans le champ vide |
| `controls` | affiche les boutons du lecteur vidéo |
| `muted` | vidéo sans son (obligatoire pour la lecture automatique) |
| `playsinline` | lecture dans la page sur mobile |
| `alt` | texte alternatif d'une image (accessibilité) |
| `lang="fr"` | langue de la page |
| `<meta name="viewport">` | adapte la page aux mobiles |

---

## 9. Tailwind CSS : classes utilisées

### Q : Quelle est l'unité de mesure de Tailwind ?

**1 unité = 4px.** Donc `p-4` = 16px, `h-10` = 40px, `w-80` = 320px, `gap-3` = 12px. Pour une valeur précise : `w-[340px]`, `text-[11px]`.

### Q : Quelles classes de mise en page ?

| Classe | Effet |
|---|---|
| `flex` | active Flexbox (éléments côte à côte) |
| `flex-col` | éléments en colonne |
| `flex-1` | prend tout l'espace restant |
| `items-center` | centre en hauteur (dans un flex) |
| `justify-between` | écarte les éléments aux extrémités |
| `gap-3` | espace entre les éléments |
| `grid` | active CSS Grid |
| `place-items-center` | centre en hauteur **et** largeur (dans un grid) |
| `space-y-2` | espace vertical entre les enfants (colonne) |
| `mx-auto` | centre horizontalement un bloc |
| `min-w-0` | permet à un texte long de se réduire dans un flex |
| `shrink-0` | empêche un élément de rétrécir |

### Q : Quelles classes de taille et d'espacement ?

| Classe | Effet |
|---|---|
| `w-full` / `h-full` | 100 % de la largeur / hauteur du parent |
| `w-10 h-10` | 40px × 40px |
| `min-h-screen` | au moins la hauteur de l'écran |
| `max-w-4xl` | largeur maximum de 896px |
| `p-5`, `px-4`, `py-3` | padding (tous côtés, horizontal, vertical) |
| `pt-6`, `pb-3` | padding haut, bas |
| `mt-4` | marge au-dessus |

### Q : Quelles classes pour l'image et la vidéo ?

| Classe | Effet |
|---|---|
| `aspect-video` | garde un ratio 16:9 (la hauteur se calcule toute seule) |
| `object-cover` | l'image remplit le cadre sans être déformée (elle est recadrée) |
| `overflow-hidden` | cache ce qui dépasse (nécessaire pour les coins arrondis) |
| `rounded-2xl` | coins arrondis (16px) |

### Q : Quelles classes de position ?

| Classe | Effet |
|---|---|
| `relative` | le parent devient le repère |
| `absolute` | l'élément se place librement dans son parent `relative` |
| `inset-0` | l'élément remplit tout le parent |
| `fixed` | l'élément reste fixe à l'écran (spinner plein écran) |
| `sticky top-0` | l'élément reste collé en haut au défilement |
| `z-30`, `z-50` | ordre d'empilement (plus grand = au-dessus) |

### Q : Quelles classes de couleur et de texte ?

| Classe | Effet |
|---|---|
| `bg-slate-900` | fond gris-bleu foncé |
| `bg-white/5` | fond blanc à 5 % d'opacité (le `/5` est l'opacité) |
| `text-slate-200` | couleur du texte |
| `border border-white/10` | bordure fine, semi-transparente |
| `text-sm`, `text-5xl` | taille du texte (14px, 48px) |
| `font-bold`, `font-semibold` | graisse du texte |
| `uppercase`, `tracking-widest` | majuscules, espacement des lettres |
| `bg-gradient-to-br from-red-600 to-green-600` | dégradé diagonal rouge vers vert |

### Q : Quelles classes pour les interactions et animations ?

| Classe | Effet |
|---|---|
| `hover:bg-white/[.06]` | change le fond au survol |
| `transition` | rend les changements fluides |
| `cursor-pointer` | curseur en main |
| `outline-none` | retire le contour du navigateur au focus |
| `animate-spin` | rotation continue (spinner) |
| `hidden` | cache l'élément (`display: none`) |

### Q : Que veulent dire les crochets, comme `bg-white/[0.03]` ?

Ce sont des **valeurs arbitraires** : quand Tailwind n'a pas la valeur exacte, on l'écrit entre crochets. Attention : pas d'espace à l'intérieur, et le `/` est obligatoire pour l'opacité (`hover:bg-white/[.06]`, pas `hover:bg-white[.06]`).

### Q : Qu'est-ce qu'un préfixe comme `hover:` ?

Un préfixe applique la classe seulement dans un certain cas : `hover:` (survol), `focus:` (champ actif), `md:` (écran moyen et plus), `max-sm:` (petits écrans).

---

## 10. Gestion des états : chargement et erreur

### Q : Quelle est la logique du Loading state ?

```
1. Au départ        → afficher le spinner
2. fetch en cours   → on attend (await)
3a. Succès          → cacher le spinner
3b. Échec           → cacher le spinner + afficher l'erreur
```

Un bloc HTML est caché ou montré en ajoutant / retirant la classe `hidden`.

### Q : Comment tester les états ?

Dans les outils développeur (F12), onglet **Network** :
- **Slow 4G** : le spinner reste visible plus longtemps.
- **Offline** : l'écran d'erreur apparaît.
- Une URL volontairement fausse déclenche un code `404`.

### Q : Pourquoi vérifier `res.ok` ?

`fetch` ne lève **pas** d'erreur pour un 404 ou un 500 : il considère que la requête a abouti. C'est à nous de tester `res.ok` et de lancer l'erreur nous-mêmes.

---

## 11. Git et GitHub

### Q : Quelles branches utiliser ?

| Branche | Contenu |
|---|---|
| `main` | version stable |
| `develop` | intégration des fonctionnalités |
| `feature/mockapi-service` | `services/api.js` |
| `feature/preview-ui` | zone de prévisualisation et liste |
| `feature/search` | recherche instantanée |

### Q : Quelles commandes de base ?

```bash
git checkout -b feature/search      # créer et aller sur une branche
git add .                           # préparer les fichiers
git commit -m "feat: add instant search"
git push origin feature/search      # envoyer sur GitHub
```

Puis ouvrir une **Pull Request** vers `develop` sur GitHub.

### Q : Qu'est-ce que Conventional Commits ?

Une convention de message : `type: description`.

| Type | Usage |
|---|---|
| `feat:` | nouvelle fonctionnalité |
| `fix:` | correction de bug |
| `docs:` | documentation |
| `style:` | mise en forme sans changer la logique |
| `refactor:` | réorganisation du code |

Exemples : `feat: add loading spinner`, `fix: correct epg endTime display`.

---

## 12. Erreurs fréquentes et débogage

### Q : Où voir les erreurs ?

Dans la **console** du navigateur (F12, onglet Console). La première ligne rouge est la plus importante : elle donne le fichier et le numéro de ligne.

### Q : Que veulent dire ces erreurs ?

| Message | Cause probable | Solution |
|---|---|---|
| `x is not defined` | fonction ou variable utilisée sans `import` ni déclaration | ajouter l'`import` ou corriger le nom |
| `Cannot read properties of null` | `getElementById` n'a pas trouvé l'élément | vérifier l'`id` dans le HTML |
| `Cannot read properties of undefined` | une donnée n'existe pas (ex. `chaine.epg` absent) | vérifier le nom du champ dans le JSON |
| `Failed to fetch` | pas de connexion ou mauvaise URL | vérifier internet et l'URL MockAPI |
| `HTTP Error : 404` | URL de l'API incorrecte | corriger l'endpoint |
| `Unexpected token 'export'` | `type="module"` manquant | l'ajouter sur la balise script |
| `CORS` | page ouverte en `file://` | utiliser Live Server |

### Q : Pourquoi mes changements JS ne s'appliquent-ils pas ?

Le navigateur garde parfois l'ancien fichier en cache. Recharge sans cache avec **Ctrl + Shift + R**.

### Q : Pourquoi une classe Tailwind ne fonctionne-t-elle pas ?

Vérifie : la faute de frappe (`boder` au lieu de `border`), le `/` oublié (`bg-white/5`), les majuscules (`to-RED-600` doit être `to-red-600`), et l'absence d'espaces dans les valeurs entre crochets.

### Q : Comment tester une fonction pas à pas ?

Ajoute des `console.log` à chaque étape :

```javascript
console.log("1. données :", channels);
console.log("2. texte tapé :", texte);
console.log("3. trouvées :", filtered.length);
```

Le premier `console.log` qui n'affiche rien ou qui affiche une valeur fausse indique l'endroit du problème.

### Q : Comment éviter les erreurs d'`id` ?

Garde un tableau des `id` (section 8) et vérifie dans la console avec `document.getElementById("channel-name")` : si tu obtiens `null`, l'`id` est absent ou mal écrit.

---

## User stories couvertes

| User story | Où dans le code |
|---|---|
| Architecture modulaire | `services/`, `js/ui.js`, `js/search.js`, `js/app.js` |
| `async/await` + `try/catch` | `getData()` et `init()` |
| `map`, `filter`, `find` | recherche, filtre par pays |
| Fetch + `response.ok` | `getData()` |
| Loading state | `#loading`, `init()` |
| Error state | `#error`, `catch`, bouton « Réessayer » |
| Panneau des chaînes et prévisualisation | `afficherChaines()`, `showChannelInfo()` |
| Recherche instantanée | `searchChannels()` |
| Git, branches, Conventional Commits | section 11 |
| Tailwind uniquement | section 9 |
