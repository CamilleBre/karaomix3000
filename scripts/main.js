// Sélection des éléments HTML
const rotatingButton = document.getElementById("rotating-button");
const randomVideoButton = document.getElementById("randomVideoButton");
const videoContainer = document.getElementById("videoContainer");
const filtersContainer = document.getElementById("filtersContainer");

// Variables globales
let allVideos = []; // Stocke toutes les vidéos chargées
let filteredVideos = []; // Stocke les vidéos filtrées
let activeFilters = { language: new Set(), categories: new Set() }; // Garde les filtres activés

// Positions pour le bouton rond
const positions = [0, 90, 200];
let currentIndex = 0;

// Charger les vidéos depuis un fichier JSON
async function loadVideos() {
    try {
        const response = await fetch("videos.json");
        allVideos = await response.json();
        filteredVideos = allVideos; // Toutes les vidéos sont activées par défaut
        createFilters(allVideos); // Crée les boutons de filtres
    } catch (error) {
        console.error("Erreur lors du chargement des vidéos :", error);
    }
}

// Crée les boutons de filtres dynamiques
function createFilters(videos) {
    const languages = [...new Set(videos.map(video => video.language))]; // Langues uniques
    const categories = [...new Set(videos.flatMap(video => video.categories))]; // Catégories uniques

    filtersContainer.innerHTML = "<h3>Filtres :</h3><div id='languageFilters'></div><div id='categoryFilters'></div>";
    const languageFilters = document.getElementById("languageFilters");
    const categoryFilters = document.getElementById("categoryFilters");

    // Crée les boutons pour les langues
    languages.forEach(language => {
        const button = document.createElement("button");
        button.className = "filter-button active";
        button.innerText = language;
        activeFilters.language.add(language); // Active par défaut
        button.addEventListener("click", () => toggleFilter("language", language, button));
        languageFilters.appendChild(button);
    });

    // Crée les boutons pour les catégories
    categories.forEach(category => {
        const button = document.createElement("button");
        button.className = "filter-button active";
        button.innerText = category;
        activeFilters.categories.add(category); // Active par défaut
        button.addEventListener("click", () => toggleFilter("categories", category, button));
        categoryFilters.appendChild(button);
    });
}

// Gestion de l'activation/désactivation des filtres
function toggleFilter(filterType, filterValue, button) {
    const isActive = activeFilters[filterType].has(filterValue);

    // Ajoute ou retire le filtre
    if (isActive) {
        activeFilters[filterType].delete(filterValue);
        button.classList.remove("active");
    } else {
        activeFilters[filterType].add(filterValue);
        button.classList.add("active");
    }

    applyFilters();
}

// Applique les filtres activés aux vidéos disponibles
function applyFilters() {
    filteredVideos = allVideos.filter(video => {
        const matchesLanguage = activeFilters.language.has(video.language);
        const matchesCategory = video.categories.some(category => activeFilters.categories.has(category));
        return matchesLanguage && matchesCategory;
    });

    displayRandomVideo();
}

// Affiche une vidéo aléatoire parmi les vidéos filtrées
function displayRandomVideo() {
    if (filteredVideos.length === 0) {
        videoContainer.innerHTML = "<p>Aucune vidéo ne correspond aux filtres sélectionnés.</p>";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredVideos.length);
    const selectedVideo = filteredVideos[randomIndex];

    // Afficher uniquement le lien vers la vidéo sans l'intégrer
    videoContainer.innerHTML = `
        <h2>${selectedVideo.title}</h2>
        <p>Langue : ${selectedVideo.language}</p>
        <p>Catégories : ${selectedVideo.categories.join(", ")}</p>
        <p>Set Thermomix : ${selectedVideo.setThermomix ? "Oui" : "Non"}</p>
    `;

    // Ouvrir directement la vidéo sur YouTube dans un nouvel onglet
    randomVideoButton.addEventListener("click", () => {
        window.open(selectedVideo.url, "_blank"); // Ouvre l'URL de la vidéo dans un nouvel onglet
    });
}

// Gestion du bouton rond avec rotation
rotatingButton.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % positions.length;
    rotatingButton.style.transform = `rotate(${positions[currentIndex]}deg)`;
});

// Bouton pour afficher une nouvelle vidéo
randomVideoButton.addEventListener("click", displayRandomVideo);

// Charger les vidéos et afficher la première vidéo
document.addEventListener("DOMContentLoaded", async () => {
    await loadVideos();
    displayRandomVideo();
});
