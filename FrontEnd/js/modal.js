let modal = null
let focusables =[]
let previouslyFocusedElement = null

async function main() {
    init();
    await displayItemsModal();
    await displayCategoriesModal();
    updateButtonState();
}
main();

/* Pour afficher la galerie et cacher la section d'ajout de photo en modifiant leur style d'affichage*/

function resetModalDisplay() {
    const galleryModalContainer = document.getElementById('gallery-modal-container');
    const addPictureModal = document.getElementById('add-picture-modal');
    
    galleryModalContainer.style.display = 'block';
    addPictureModal.style.display = 'none';
}

/*  Ouverture de la modal */

function openModal(e) {
    modal = document.getElementById('modal-admin');
    resetModalDisplay();
    modal.style.display = null;
    
    modal.removeAttribute('aria-hidden');
    modal.setAttribute('aria-modal','true');
    modal.addEventListener('click', closeModal);

    const jsModalClose = document.getElementById('js-modal-close');
    jsModalClose.addEventListener('click', closeModal);

    const jsModalStop = document.getElementById('js-modal-stop');
    jsModalStop.addEventListener('click', stopPropagation);
}

/* Fermeture de la modal */

function closeModal() {
    if(modal === null) return;

    resetModalDisplay();

    window.setTimeout(function(){
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
        modal = null;
    }, 10);

    // Suppression des écouteurs d'événements
    modal.removeEventListener('click', closeModal)
    document.querySelector('.js-modal-close').removeEventListener('click', closeModal)
    document.querySelector('.js-modal-stop').removeEventListener('click', stopPropagation)
}

/* Arrêter la propagation d'un événement */

function stopPropagation(e){
    e.stopPropagation()
}

/* Gère la nav avec le clavier à l'intérieur de la modal (TAB ou SHIFT + TAB) */

function focusInModal(e){
    e.preventDefault()

    let index = focusables.findIndex(f => f === modal.querySelector(':focus'))
    
    if (e.shiftKey === true){
        index--
    } else{
        index++
    }
    if (index>= focusables.length){
        index=0
    }
    if (index<0){
        index= focusables.length -1
    }
    
    focusables[index].focus()
}

/* Affiche les éléments depuis l'API dans la galerie modal, avec gestion erreur. */

async function displayCategoriesModal() {
    fetch("http://localhost:5678/api/categories")
    .then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            console.log("Erreur");
        }
    })
    .then((categories) => {
        categories.forEach((categorie) => {
            displayCategoryModal(categorie);        
        });
    })
    .catch((error) => {
        console.log(error);
    });
}

function displayCategoryModal(categorie) {
    const categoryContainer = document.getElementById('category');
    const category = document.createElement("option");

    category.setAttribute("value", categorie.id);
    category.innerText = categorie.name;
    categoryContainer.appendChild(category);
}

async function displayItemsModal() {
    const modalContent = document.querySelector(".modal-content");

    fetch('http://localhost:5678/api/works')
    .then(response => response.json())
    .then(data => {
        modalContent.innerHTML = ''; // Vide la div gallery avant de rajouter des éléments
        data.forEach(itemModal => {
            displayItemModal(itemModal); // Affiche chaque élément récupéré de l'API
        });
    })
    .catch(error => console.error('Error:', error)); 
}

function displayItemModal(itemModal) {
    const modalContent = document.querySelector(".modal-content");
    const figure = document.createElement('div'); // Utilisez 'div' et ajoutez la classe 'figure-modal'
        figure.classList.add('figure-modal'); 
    
    const galleryItem = document.createElement('div');
        galleryItem.classList.add('gallery-item');
    
    const img = document.createElement("img");
        img.src = itemModal.imageUrl;
        img.alt = itemModal.title;
        img.classList.add('gallery-image');
        img.setAttribute('data-id', itemModal.id);
    
    const deleteButton = document.createElement('button');
        deleteButton.classList.add('button-delete');
        deleteButton.setAttribute('data-id', itemModal.id); 
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.addEventListener('click', pictureDelete);
    
    figure.appendChild(deleteButton);
    figure.appendChild(img);

    modalContent.appendChild(figure);
}
    
/* Supp Img, avec l'API et la MAJ de l'interface utilisateur. */

async function pictureDelete(event) {
    
    const figureElement = event.target.closest('.figure-modal');
    
    if (!figureElement) {
        console.error("Élément figure-modal non trouvé");
        return;
    }

    const id = figureElement.querySelector('.gallery-image').dataset.id;
    const token = sessionStorage.getItem("token");
    
    fetch(`http://localhost:5678/api/works/${id}`, { 
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}` 
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erreur lors de la suppression: ${response.status}`);
        }
        return response.text();
    })
    .then(text => {
        try {
            const data = JSON.parse(text);
            console.log("Suppression réussie", data);
        } catch (error) {
            console.log("Suppression réussie, aucune donnée retournée");
        }
        figureElement.remove();
        displayItemsModal();
        displayWorks();
    })
    .catch(error => {
        console.error("Erreur lors de la suppression", error);
    });
}

/* Active/désactive btn de "valider" s'il y a une IMG, d'un titre et d'une selection de catégorie avec chgt de couleur (gris !ok vert ok) */

function updateButtonState() {
    const imgInput = document.getElementById('image');
    const titreInput = document.getElementById('titre');
    const categoryInput = document.getElementById('category');
    const conditionsRemplies = imgInput.files.length > 0 && titreInput.value.trim() !== "" && categoryInput.value !== "";
    const buttonValider = document.getElementById('valider');

    buttonValider.disabled = !conditionsRemplies;
    buttonValider.style.backgroundColor = conditionsRemplies ? '#1D6154' : '#CBD6DC';
}

/*Envoie les données du formulaire(IMG, titre et catégorie), à l'API et envoie une réponse ou affiche une erreur. */

async function sendFormData(imgFile, titre, categorieId, event) {
    const token = sessionStorage.getItem("token");
    
    const formData = new FormData();
    formData.append('image', imgFile); // Assurez-vous que imgFile est le fichier d'image correct
    formData.append('title', titre);
    formData.append('category', parseInt(categorieId));

    fetch('http://localhost:5678/api/works', {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(data => {
        closeModal(event);
        displayItemsModal();
        displayWorks();
    })
    .catch(error => {
        alert('Erreur : ' + error.message);
    });
}

/* Initialise et gère les modals pour la navigation et la fermeture */

function deleteUploadPicture() {
    const previewContainer = document.getElementById('picture-preview');
    const tmpImage = document.getElementById('tmpImage');
    const imgInput = document.getElementById('image');

    if (tmpImage) {
        previewContainer.removeChild(tmpImage);    
    }
    if (imgInput) {
        imgInput.value = null;
    }
    previewContainer.innerHTML = '';
    document.getElementById('delete-picture-preview').style.display = 'none';
    updateButtonState();
}

/* Initialise et gère les modals pour la navigation et la fermeture */

function init() {    // Modal parent
    const modal = document.getElementById('modal-admin');
    
    // Première et deuxième modal dans le modal parent
    const modal1 = document.getElementById('gallery-modal-container');
    const modal2 = document.getElementById('add-picture-modal');
    
    // Boutons
    const addButton = document.getElementById('modal-add-picture'); // bouton pour ajouter une photo
    const backButton = document.getElementById('back-to-gallery'); // bouton pour retourner à la première modal
    const closeButton = document.getElementById('close-modal'); // bouton pour fermer la modal globale

    // Événement de clic sur le bouton "Ajouter une photo"
    addButton.addEventListener('click', () => {
        modal1.style.display = 'none';
        modal2.style.display = 'block';
        modal2.removeAttribute('aria-hidden');
        modal2.setAttribute('aria-modal', 'true');
    });

    // Événement de clic sur le bouton "Retour"
    backButton.addEventListener('click', () => {
        modal2.style.display = 'none';
        modal1.style.display = 'block';
        modal1.removeAttribute('aria-hidden');
        modal1.setAttribute('aria-modal', 'true');
    });

    // Événement de clic sur le bouton "Fermer"
    closeButton.addEventListener('click', () => {
        modal2.style.display = 'none';
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
    });

    const form = document.getElementById('form-modal2');
    const imgInput = document.getElementById('image');
    const titreInput = document.getElementById('titre');
    const categoryInput = document.getElementById('category');
    
    form.addEventListener('change', updateButtonState);
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const imgFiles = imgInput.files[0];
        const titre = titreInput.value;
        const categorieId = categoryInput.value;

        sendFormData(imgFiles, titre, categorieId, event);
    });

    document.getElementById('image').addEventListener('change', function(event) {
        const input = event.target;
    
        if (input.files && input.files[0]) {
            let reader = new FileReader();
    
            reader.onload = function(e) {
                let previewContainer = document.getElementById('picture-preview');
                const deletePicturePreview = document.getElementById('delete-picture-preview');
                previewContainer.innerHTML = '';
    
                let img = document.createElement('img');

                img.id = 'tmpImage';
                img.src = e.target.result;
                img.style.maxWidth = '200px';
                img.style.objectFit = 'cover';
                img.style.height = '100%';

                previewContainer.appendChild(img);
                deletePicturePreview.style.display = 'block';
            };
            reader.readAsDataURL(input.files[0]);
        }
    });

    const deletePicturePreview = document.getElementById('delete-picture-preview');
    deletePicturePreview.addEventListener('click', deleteUploadPicture);

    const adminButton = document.getElementById('admin-modal-button');
    adminButton.addEventListener('click', openModal);
    
    window.addEventListener("keydown", function (e){
        if (e.key === "Escape" || e.key === "Esc") {
            closeModal(e);
        }
        if (e.key === "Tab" && modal !== null) {
            focusInModal(e);
        }
    })
};
