// Affiche un message indiquant que le script a été chargé
console.log("script chargé");

// Variable contenant le chemin d'accès à la base de données JSON
let accesBD = 'books.json';
// Tableau pour stocker toutes les données
let allData = [];
// Variables pour les sélections de catégories et d'auteurs
let selectCategorie;
let selectAuteur;

// Fonction qui formate la date au format "jour mois année"
const getFormattedDate = (publishedDate) => {
    // Tableau contenant les noms des mois en français
    const months = [
        'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    // Crée un objet de date à partir de la date de publication fournie
    const date = new Date(publishedDate.dt_txt);
    // Récupère le jour du mois
    const day = date.getDate();
    // Récupère le mois à partir du tableau 'months'
    const month = months[date.getMonth()];
    // Récupère l'année
    const year = date.getFullYear();

    // Retourne la date formatée au format souhaité
    return `${day} ${month} ${year}`;
};

// Fonction pour créer une carte de livre à partir des données fournies
function createCard(bookData) {
    // Destructuration des données du livre
    const { title, isbn, pageCount, publishedDate, thumbnailUrl, shortDescription } = bookData;

    // Création de l'élément div pour la carte
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('col-lg-4', 'col-xl-3', 'col-md-6', 'col-12');

    // Création de l'élément div pour la carte
    const card = document.createElement('div');
    card.classList.add('card', 'p-3', 'my-3', 'mx-auto');
    card.style.width = '18rem';
    card.style.height = '75rem';

    // Création de l'élément div pour le corps de la carte
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    // Création de l'élément image pour la couverture du livre
    const imageElement = document.createElement('img');
    imageElement.classList.add('card-img-top');
    imageElement.src = thumbnailUrl || 'https://p1.storage.canalblog.com/14/48/1145642/91330992_o.png'; // Utilisez une image de remplacement si l'URL de l'image est manquante
    imageElement.alt = "Couverture livre";

    // Création de l'élément pour le titre du livre
    const titleElement = document.createElement('h5');
    titleElement.classList.add('card-title');
    titleElement.innerText = title;

    // Création de l'élément pour l'ISBN du livre
    const isbnElement = document.createElement('p');
    isbnElement.classList.add('card-text', 'ISBN');
    isbnElement.innerText = `ISBN: ${isbn}`;

    // Création de l'élément pour le nombre de pages du livre
    const nbPageElement = document.createElement('p');
    nbPageElement.classList.add('card-text', 'nb-page');
    nbPageElement.innerText = `Nombre de pages: ${pageCount}`;

    // Création de l'élément pour la date de publication du livre
    const publishedDateElement = document.createElement('p');
    publishedDateElement.classList.add('card-text', 'published-date');
    publishedDateElement.innerText = publishedDate ? `Date de publication: ${getFormattedDate(publishedDate)}` : 'Date de publication non disponible';

    // Création de l'élément pour la description courte du livre
    let addShortDescription = document.createElement('p');
    addShortDescription.classList.add('card-text', 'shortDescription');
    addShortDescription.innerText = shortDescription ? `Description courte : ${shortDescription}` : null;

    // Ajout des éléments au corps de la carte
    cardBody.appendChild(titleElement);
    cardBody.appendChild(imageElement);
    cardBody.appendChild(document.createElement('hr'));
    cardBody.appendChild(isbnElement);

    if (pageCount !== 0) {
        cardBody.appendChild(document.createElement('hr'));
        cardBody.appendChild(nbPageElement);
    }

    if (publishedDateElement !== "") {
        cardBody.appendChild(document.createElement('hr'));
        cardBody.appendChild(publishedDateElement);
    }

    cardBody.appendChild(document.createElement('hr'));
    cardBody.appendChild(addShortDescription);

    // Ajout du corps de la carte à la carte
    card.appendChild(cardBody);
    // Ajout de la carte à la div de la carte
    cardDiv.appendChild(card);

    // Retourne la div de la carte complète
    return cardDiv;
}





// Écouteur d'événements qui attend que le DOM soit entièrement chargé
document.addEventListener("DOMContentLoaded", function () {

    // Récupération des éléments de sélection par ID
    selectCategorie = document.getElementById('categorie_select');
    selectAuteur = document.getElementById('auteur_select');

    // Affichage de l'indicateur de chargement
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';

    // Récupération des données depuis la base de données
    setTimeout(function () {
        fetch(accesBD)
            .then((res) => res.json())
            .then(data => {
                // Stockage des données dans la variable allData
                allData = data;

                // Récupération du conteneur principal pour les cartes
                const mainContainer = document.querySelector('div.section-card');

                // Vérification si des données sont présentes
                if (data.length === 0) {
                    // Création d'un message indiquant l'absence de données
                    const noDataMessage = document.createElement('p');
                    noDataMessage.innerText = 'Aucune donnée n\'est disponible pour le moment.';
                    mainContainer.appendChild(noDataMessage);
                } else {
                    // Création de la liste déroulante des auteurs
                    const selectAuteur = document.getElementById('auteur_select');
                    const auteurs = [...new Set(data.map(item => item.authors).flat())];
                    const defaultOption = document.createElement('option');
                    // Ajout d'une option par défaut pour les auteurs
                    defaultOption.value = 'Tous les auteurs';
                    defaultOption.text = 'Tous les auteurs';
                    selectAuteur.appendChild(defaultOption);

                    auteurs.sort();
                    // Ajout des auteurs à la liste déroulante
                    auteurs.forEach(auteur => {
                        if (auteur != "") {
                            const option = document.createElement('option');
                            option.value = auteur;
                            option.text = auteur;
                            selectAuteur.appendChild(option);
                        }

                    });

                    // Ajout d'un écouteur d'événements pour la sélection d'auteurs
                    selectAuteur.addEventListener('change', function () {
                        const selectedAuteur = selectAuteur.value;
                        // Affichage ou masquage de la sélection de catégorie en fonction du choix d'auteur
                        if (selectedAuteur !== 'Tous les auteurs') {
                            selectCategorie.style.display = 'none';
                        } else {
                            selectCategorie.style.display = 'block';
                        }
                        applyFilters(); // Application des filtres
                    });

                    // Création des cartes pour chaque élément de données
                    allData.forEach(item => {
                        const card = createCard(item);
                        mainContainer.appendChild(card);
                    });

                    // Création de la liste déroulante des catégories
                    const selectCategorie = document.getElementById('categorie_select');
                    const categories = [...new Set(data.map(item => item.categories).flat())];
                    const defaultCategorieOption = document.createElement('option');
                    defaultCategorieOption.value = 'Toutes les catégories';
                    defaultCategorieOption.text = 'Toutes les catégories';
                    selectCategorie.appendChild(defaultCategorieOption);

                    categories.sort();
                    // Ajout des catégories à la liste déroulante
                    categories.forEach(categorie => {
                        if (categorie != '') {
                            const option = document.createElement('option');
                            option.value = categorie;
                            option.text = categorie;
                            selectCategorie.appendChild(option)
                        };
                    });
                }

                // Ajout d'un écouteur d'événements pour la sélection de catégories
                selectCategorie.addEventListener('change', function () {
                    const selectedCategorie = selectCategorie.value;
                    // Affichage ou masquage de la sélection d'auteur en fonction du choix de catégorie
                    if (selectedCategorie !== 'Toutes les catégories') {
                        selectAuteur.style.display = 'none';
                    } else {
                        selectAuteur.style.display = 'block';
                    }
                    applyFilters(); // Application des filtres
                });

                // Ajout d'un autre écouteur d'événements pour la sélection de catégories
                selectCategorie.addEventListener('change', applyFilters);

                // Fonction pour appliquer les filtres
                function applyFilters() {
                    const selectedAuteur = selectAuteur.value;
                    const selectedCategorie = selectCategorie.value;
                    mainContainer.innerHTML = ''; // Nettoyage du conteneur principal

                    // Filtrage des données en fonction des sélections
                    const filteredData = allData.filter(item => {
                        console.log('Item Authors:', item.authors);
                        console.log('Item Categories:', item.categories);
                        const matchAuteur = selectedAuteur === 'Tous les auteurs' || item.authors.includes(selectedAuteur);
                        const matchCategorie = selectedCategorie === 'Toutes les catégories' || item.categories.includes(selectedCategorie);
                        return matchAuteur && matchCategorie;
                    });

                    // Gestion des cas où aucune donnée ne correspond aux filtres
                    if (filteredData.length === 0) {
                        const noDataMessage = document.createElement('p');
                        noDataMessage.innerText = 'Aucune donnée disponible pour cette sélection.';
                        mainContainer.appendChild(noDataMessage);
                    } else {
                        // Création des cartes pour les données filtrées
                        filteredData.forEach(item => {
                            const card = createCard(item);
                            mainContainer.appendChild(card);
                        });
                    }
                }
                loadingIndicator.style.display = 'none'; // Masquage de l'indicateur de chargement après le chargement des données
            })
            .catch(error => console.error('Une erreur est survenue lors de la récupération des données : ', error));
    }, 100);
})


