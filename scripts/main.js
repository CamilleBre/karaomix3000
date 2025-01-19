// Sélection des éléments HTML
const randomVideoButton = document.getElementById("randomVideoButton");
const nextVideoButton = document.getElementById("nextVideoButton");
const videoContainer = document.getElementById("videoContainer");
const filtersContainer = document.getElementById("filtersContainer");
const rotatingButtonContainer = document.getElementById("rotatingButtonsContainer");
const fireContainer = document.querySelector(".fire-container");

// Variables globales
let allVideos = [];
let filteredVideos = [];
let activeFilters = {
    language: new Set(),
    categories: new Set(["setlistTMX", "lesbianAnthem"]), // Actifs par défaut
    rotatingValues: {} // Pour stocker les valeurs des boutons rotatifs
};

const categories = [
    { name: "difficulty", values: ["", "Facile", "Ça passe", "Hardcore"] },
    { name: "cheeseFactor", values: ["", "Subtil", "Crémeux", "Coulant"] },
    { name: "unexpectedFactor", values: ["", "Culte", "Prévisible", "Surprise garantie"] }
];

// Charger les vidéos depuis un fichier JSON
async function loadVideos() {
    try {
        const response = await fetch("videos_test1.json");
        allVideos = await response.json();
        filteredVideos = allVideos; // Initialise avec toutes les vidéos
        console.log("Vidéos chargées :", allVideos);
        createFilters(allVideos);
        createRotatingButtons();
    } catch (error) {
        console.error("Erreur lors du chargement des vidéos :", error);
    }
}

// Crée les boutons de filtres dynamiques
function createFilters(videos) {
    const languages = [...new Set(videos.map(video => video.language))];

    filtersContainer.innerHTML = "<div id='languageFilters'></div><div id='categoryFilters'></div>";
    const languageFilters = document.getElementById("languageFilters");
    const categoryFilters = document.getElementById("categoryFilters");

    // Filtres par langue
    languages.forEach(language => {
        const button = document.createElement("button");
        button.className = "filter-button active";
        button.innerText = language;
        activeFilters.language.add(language);
        button.addEventListener("click", () => toggleFilter("language", language, button));
        languageFilters.appendChild(button);
    });
    console.log("Filtres de langues créés :", [...activeFilters.language]);

    // Filtres pour Setlist TMX (actif par défaut)
    const setlistButton = document.createElement("button");
    setlistButton.className = "filter-button active";
    setlistButton.innerText = "Setlist TMX";
    setlistButton.addEventListener("click", () => toggleFilter("categories", "setlistTMX", setlistButton));
    categoryFilters.appendChild(setlistButton);

    // Filtres pour Lesbian Anthems (actif par défaut)
    const lesbianButton = document.createElement("button");
    lesbianButton.className = "filter-button active";
    lesbianButton.innerText = "Lesbian Anthems";
    lesbianButton.addEventListener("click", () => toggleFilter("categories", "lesbianAnthem", lesbianButton));
    categoryFilters.appendChild(lesbianButton);

    console.log("Filtres de catégories créés :", [...activeFilters.categories]);
}

// Gestion de l'activation/désactivation des filtres
function toggleFilter(filterType, filterValue, button) {
    const isActive = activeFilters[filterType].has(filterValue);

    if (isActive) {
        activeFilters[filterType].delete(filterValue);
        button.classList.remove("active");
    } else {
        activeFilters[filterType].add(filterValue);
        button.classList.add("active");
    }

    console.log(`Filtre modifié (${filterType}) :`, [...activeFilters[filterType]]);
    applyFilters();
}

// Créer les boutons rotatifs pour chaque catégorie
function createRotatingButtons() {
    categories.forEach(category => {
        const categoryContainer = document.createElement("div");
        categoryContainer.classList.add("category-container");

        const categoryTitle = document.createElement("h3");
        categoryTitle.classList.add("category-title");
        categoryTitle.textContent = category.name.charAt(0).toUpperCase() + category.name.slice(1).replace(/_/g, " ");
        categoryContainer.appendChild(categoryTitle);

        const button = document.createElement("div");
        button.classList.add("rotating-button");
        button.dataset.position = 0;

        const buttonText = document.createElement("span");
        buttonText.textContent = category.values[0];
        button.appendChild(buttonText);

        // Enregistre la valeur par défaut dans activeFilters
        activeFilters.rotatingValues[category.name] = category.values[0];

        button.addEventListener("click", () => {
            let currentPosition = parseInt(button.dataset.position, 10);
            currentPosition = (currentPosition + 1) % category.values.length;
            button.dataset.position = currentPosition;

            const newValue = category.values[currentPosition];
            buttonText.textContent = newValue;

            // Met à jour activeFilters avec la nouvelle valeur
            activeFilters.rotatingValues[category.name] = newValue;

            console.log(`Valeur du bouton ${category.name} modifiée :`, newValue);
            applyFilters();
        });

        categoryContainer.appendChild(button);
        rotatingButtonContainer.appendChild(categoryContainer);
    });
}

// Ajuster dynamiquement le nombre de flammes
function adjustFlames() {
    const flameWidth = 100; // Largeur approximative d'une flamme
    const screenWidth = window.innerWidth;
    const numFlames = Math.ceil(screenWidth / flameWidth);

    // Supprime les flammes existantes
    fireContainer.innerHTML = "";

    // Ajoute les flammes nécessaires
    for (let i = 0; i < numFlames; i++) {
        const flame = document.createElement("img");
        flame.src = "assets/flamme2.gif"; // Chemin vers l'image des flammes
        flame.alt = "Flamme";
        flame.className = "fire-gif";
        fireContainer.appendChild(flame);
    }

    console.log(`Nombre de flammes ajusté à : ${numFlames}`);
}

// Applique les filtres activés aux vidéos disponibles
function applyFilters() {
    console.log("Application des filtres :", activeFilters);

    filteredVideos = allVideos.filter(video => {
        console.log("Vidéo analysée :", video);

        // Vérifie si la langue correspond
        const matchesLanguage = activeFilters.language.size === 0 || activeFilters.language.has(video.language);

        // Vérifie le filtre Setlist TMX
        const matchesSetlist = activeFilters.categories.has("setlistTMX") ? video.setlistTMX === true : true;

        // Vérifie le filtre Lesbian Anthem
        const matchesLesbian = activeFilters.categories.has("lesbianAnthem") ? video.lesbianAnthem === true : true;

        // Vérifie les valeurs des boutons rotatifs
        const matchesRotatingValues = Object.entries(activeFilters.rotatingValues).every(([key, value]) => {
            if (!value || value === "") return true;
            return video[key] === value;
        });

        return matchesLanguage && matchesSetlist && matchesLesbian && matchesRotatingValues;
    });

    console.log("Vidéos après filtrage :", filteredVideos);
}

// Affiche une vidéo aléatoire parmi les vidéos filtrées
function displayRandomVideo() {
    console.log("Vidéos disponibles pour sélection :", filteredVideos);

    if (filteredVideos.length === 0) {
        videoContainer.innerHTML = "<p>Aucune vidéo ne correspond aux filtres sélectionnés.</p>";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredVideos.length);
    const selectedVideo = filteredVideos[randomIndex];
    console.log("Vidéo sélectionnée :", selectedVideo);

    videoContainer.innerHTML = `
        <h2>${selectedVideo.title}</h2>
        <p>Artiste : ${selectedVideo.artist}</p>
        <p>Langue : ${selectedVideo.language}</p>
        <p>Difficulté : ${selectedVideo.difficulty}</p>
        <p>Cheese Factor : ${selectedVideo.cheeseFactor}</p>
        <p>Effet WoW : ${selectedVideo.unexpectedFactor}</p>
        <p>Setlist TMX3000 : ${selectedVideo.setlistTMX ? "Oui" : "Non"}</p>
        <p>Hymne lesbien : ${selectedVideo.lesbianAnthem ? "Oui" : "Non"}</p>
        <a href="${selectedVideo.url}" target="_blank" rel="noopener noreferrer" class="youtube-link">Regarder sur YouTube</a>
    `;
}

// Appel au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    loadVideos();
    adjustFlames();
    randomVideoButton.addEventListener("click", displayRandomVideo);
    nextVideoButton.addEventListener("click", displayRandomVideo);

    // Ajuster les flammes au redimensionnement de la fenêtre
    window.addEventListener("resize", adjustFlames);
});
