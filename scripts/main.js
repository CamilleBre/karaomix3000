// Sélection des éléments HTML
const randomVideoButton = document.getElementById("randomVideoButton");
const videoContainer = document.getElementById("videoContainer");
const filtersContainer = document.getElementById("filtersContainer");
const slidersContainer = document.getElementById("slidersContainer");
const fireContainer = document.querySelector(".fire-container");

// Variables globales
let allVideos = [];
let filteredVideos = [];
let activeFilters = {
    language: new Set(),
    categories: new Set(), // Actifs par défaut
    sliderValues: {} // Pour stocker les valeurs des sliders
};

const categories = [
    { name: "difficulty", label: "Difficulté", values: ["Hardcore", "Ça passe", "Facile", ""] },
    { name: "cheeseFactor", label: "Cheese Factor", values: ["Coulant", "Crémeux", "Subtil", ""] },
    { name: "unexpectedFactor", label: "Effet WoW", values: ["Surprise garantie", "Prévisible", "Culte", ""] }
];

// Charger les vidéos depuis un fichier JSON
async function loadVideos() {
    try {
        const response = await fetch("videos.json");
        allVideos = await response.json();
        filteredVideos = allVideos; // Initialise avec toutes les vidéos
        console.log("Vidéos chargées :", allVideos);
        createFilters(allVideos);
        createSliders();
    } catch (error) {
        console.error("Erreur lors du chargement des vidéos :", error);
    }
}

// Crée les boutons de filtres dynamiques
function createFilters(videos) {
    const languages = [...new Set(videos.map(video => video.language))];

    // Ajouter un conteneur pour les filtres
    filtersContainer.innerHTML = `
        <h3>Filtres</h3>
        <div id='languageFilters' class='filter-group'>
        </div>
        <div id='categoryFilters' class='filter-group'>
        </div>
    `;
    const languageFilters = document.getElementById("languageFilters");
    const categoryFilters = document.getElementById("categoryFilters");

    // Filtres par langue
    languages.forEach(language => {
        const button = document.createElement("button");
        button.className = "filter-button inactive";
        button.innerText = language;
        //activeFilters.language.add(language);
        button.addEventListener("click", () => toggleFilter("language", language, button));
        languageFilters.appendChild(button);
    });

    // Filtres pour Setlist TMX
    const setlistButton = document.createElement("button");
    setlistButton.className = "filter-button inactive";
    setlistButton.innerText = "Setlist TMX";
    setlistButton.addEventListener("click", () => toggleFilter("categories", "setlistTMX", setlistButton));
    categoryFilters.appendChild(setlistButton);

    // Filtres pour Lesbian Anthems
    const lesbianButton = document.createElement("button");
    lesbianButton.className = "filter-button inactive";
    lesbianButton.innerText = "Hymne lesbien";
    lesbianButton.addEventListener("click", () => toggleFilter("categories", "lesbianAnthem", lesbianButton));
    categoryFilters.appendChild(lesbianButton);
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

// Crée les sliders pour chaque catégorie
function createSliders() {
    slidersContainer.innerHTML = ""; // Nettoie le conteneur avant de créer les sliders

    categories.forEach(category => {
        const sliderContainer = document.createElement("div");
        sliderContainer.classList.add("slider-container");

        // Label du slider
        const label = document.createElement("label");
        label.classList.add("slider-label");
        label.innerText = category.label;
        label.setAttribute("for", `slider-${category.name}`);
        sliderContainer.appendChild(label);

        // Slider input
        const slider = document.createElement("input");
        slider.type = "range";
        slider.id = `slider-${category.name}`;
        slider.min = 0;
        slider.max = category.values.length - 1;
        slider.value = category.values.length - 1; // Par défaut sur blanc (pas de filtre)
        slider.classList.add("category-slider");

        // Valeur affichée sous le slider
        const sliderValue = document.createElement("span");
        sliderValue.classList.add("slider-value");
        sliderValue.innerText = category.values[category.values.length - 1]; // Affiche "blanc" au début

        // Gère l'événement `input` pour déplacer le curseur
        slider.addEventListener("input", () => {
            const selectedValue = category.values[slider.value];
            sliderValue.innerText = selectedValue; // Met à jour l'affichage
            activeFilters.sliderValues[category.name] = selectedValue === "" ? null : selectedValue;
            console.log(`Valeur du slider ${category.name} :`, activeFilters.sliderValues[category.name]);
            applyFilters();
        });

        // Ajout des éléments au DOM
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(sliderValue);
        slidersContainer.appendChild(sliderContainer);

        // Initialise les filtres
        activeFilters.sliderValues[category.name] = null;
    });
}

// Ajuste dynamiquement le nombre de flammes
function adjustFlames() {
    const flameWidth = 50;
    const screenWidth = window.innerWidth;
    const numFlames = Math.ceil(screenWidth / flameWidth);

    fireContainer.innerHTML = ""; // Supprime les flammes existantes

    for (let i = 0; i < numFlames; i++) {
        const flame = document.createElement("img");
        flame.src = "assets/flamme2.gif";
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
        // Si aucun filtre de langue n'est actif, accepte toutes les langues
        const matchesLanguage = activeFilters.language.size === 0 || activeFilters.language.has(video.language);

        // Si aucune catégorie n'est active, accepte toutes les vidéos
        const matchesCategories = activeFilters.categories.size === 0 || (
            (activeFilters.categories.has("setlistTMX") ? video.setlistTMX === true : true) &&
            (activeFilters.categories.has("lesbianAnthem") ? video.lesbianAnthem === true : true)
        );

        // Vérifie les sliders uniquement si une valeur spécifique est définie
        const matchesSliders = Object.entries(activeFilters.sliderValues).every(([key, value]) => {
            if (value === null) return true; // Pas de filtre slider actif
            return video[key] === value;
        });

        return matchesLanguage && matchesCategories && matchesSliders;
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
    adjustFlames(); // Ajuste les flammes au chargement

    loadVideos().then(() => {
        createSliders(); // Ajoute les sliders
        applyFilters(); // Applique les filtres par défaut
    });

    randomVideoButton.addEventListener("click", displayRandomVideo);

    window.addEventListener("resize", adjustFlames); // Réajuste les flammes au redimensionnement
});
