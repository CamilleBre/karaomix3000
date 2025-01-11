// Sélection des éléments HTML
const rotatingButton = document.getElementById("rotating-button");
const randomVideoButton = document.getElementById("randomVideoButton");
const videoContainer = document.getElementById("videoContainer");
const filtersContainer = document.getElementById("filtersContainer");
const rotatingButtonContainer = document.getElementById("rotatingButtonsContainer");

// Variables globales
let allVideos = [];
let filteredVideos = [];
let activeFilters = { language: new Set(), categories: new Set() };

const categories = [
    { name: "difficulty", values: ["", "Easy", "Ça passe", "Hardcore"] },
    { name: "cheese_factor", values: ["", "No", "Plaisir coupable", "Kitsch"] },
    { name: "unexpected_factor", values: ["","Surprise garantie", "Prévisible", "Tube"] },
    { name: "heartbreak_level", values: ["","Pas triste", "Cœur brisé à 30%", "Larmes garanties"] }
];

// Positions pour le bouton rond
const positions = [0, 95, 135, 200];
let currentIndex = 0;

// Charger les vidéos depuis un fichier JSON
async function loadVideos() {
    try {
        const response = await fetch("videos.json");
        allVideos = await response.json();
        filteredVideos = allVideos;
        createFilters(allVideos);
    } catch (error) {
        console.error("Erreur lors du chargement des vidéos :", error);
    }
}

// Crée les boutons de filtres dynamiques
function createFilters(videos) {
    const languages = [...new Set(videos.map(video => video.language))];

    filtersContainer.innerHTML = "<div id='languageFilters'></div>";
    const languageFilters = document.getElementById("languageFilters");

    languages.forEach(language => {
        const button = document.createElement("button");
        button.className = "filter-button active";
        button.innerText = language;
        activeFilters.language.add(language);
        button.addEventListener("click", () => toggleFilter("language", language, button));
        languageFilters.appendChild(button);
    });
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

    applyFilters();
}

// Applique les filtres activés aux vidéos disponibles
function applyFilters() {
    filteredVideos = allVideos.filter(video => {
        const matchesLanguage = activeFilters.language.has(video.language);
        return matchesLanguage;
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

    videoContainer.innerHTML = `
        <h2>${selectedVideo.title}</h2>
        <p>Artiste : ${selectedVideo.artist}</p>
        <p>Langue : ${selectedVideo.language}</p>
        <p>Catégories : ${selectedVideo.categories.join(", ")}</p>
        <p>Ambiance : ${selectedVideo.mood}</p>
        <p>Difficulté : ${selectedVideo.difficulty}</p>
        <p>Cheese Factor : ${selectedVideo.cheeseFactor}</p>
        <p>Niveau de surprise : ${selectedVideo.unexpectedFactor}</p>
        <p>Heartbreak Level : ${selectedVideo.heartbreakLevel}</p>
        <p>Weirdness : ${selectedVideo.weirdness}</p>
        <p>Hymne lesbien : ${selectedVideo.lesbianAnthem ? "Oui" : "Non"}</p>
        <a
            href="${selectedVideo.url}"
            target="_blank"
            rel="noopener noreferrer"
            class="youtube-link"
        >
            Regarder sur YouTube
        </a>
    `;
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

        button.addEventListener("click", () => {
            let currentPosition = parseInt(button.dataset.position, 10);
            currentPosition = (currentPosition + 1) % category.values.length;
            button.dataset.position = currentPosition;

            buttonText.textContent = category.values[currentPosition];
            button.classList.remove("rotating-button");
            button.classList.add("rotating-button");
        });

        categoryContainer.appendChild(button);
        rotatingButtonContainer.appendChild(categoryContainer);
    });
}

// Appel au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    loadVideos();
    createRotatingButtons();
});
