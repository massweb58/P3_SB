

const gallery = document.querySelector(".gallery");

async function main() {
 await displayWorks();
 await displayCategories();
 initAdmin();
}
main();

async function displayWorks(categoryId) {
  fetch('http://localhost:5678/api/works')
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        console.log("Erreur");
      }
    })
    .then(data => {
      gallery.innerHTML = '';

      data.forEach(item => {
        if (!categoryId || item.category.id == parseInt(categoryId)) {
          createWork(item);
        }
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

function createWork(item) {

  const figure = document.createElement("figure");

  const img = document.createElement("img");
  img.src = item.imageUrl;
  img.alt = item.title;

  const figcaption = document.createElement("figcaption");
  figcaption.textContent = item.title;

  figure.appendChild(img);
  figure.appendChild(figcaption);

  gallery.appendChild(figure);
}

async function displayCategories() {
  fetch("http://localhost:5678/api/categories")
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        console.log("Erreur");
      }
    })
    .then((categories) => {
      displayCategory({ name: 'Tous'}, true);
      categories.forEach((categorie) => {
        displayCategory(categorie);        
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

function displayCategory(categorie, isActive) {
  const filters = document.querySelector(".filtre");
  const buttonFilter = document.createElement("button");

  buttonFilter.setAttribute("data-tag", categorie.name);
  if (categorie.id) {
    buttonFilter.setAttribute("data-id", categorie.id);
  }
  buttonFilter.classList.add("btn_filter");
  buttonFilter.innerText = categorie.name;
  if (isActive) {
    buttonFilter.classList.add("is-active");
  }
  buttonFilter.addEventListener("click", function () {
    const buttons = document.querySelectorAll(".filtre button");
    const categorieId = buttonFilter.getAttribute("data-id");

    buttons.forEach((button) => button.classList.remove("is-active"));
    buttonFilter.classList.add("is-active");

    displayWorks(categorieId);
  });
  filters.appendChild(buttonFilter);
}

function initAdmin(){
  const token = sessionStorage.getItem("token");
  const loginItem = document.getElementById("login");
  const logoutItem = document.getElementById("logout");
  const logoutLink = document.querySelector("a");
  const adminModalButton = document.getElementById('admin-modal-button');
  const editionBar = document.getElementById('edition-bar');
  const mainHeader = document.getElementById('main-header');
  const filters = document.querySelector(".filtre");

  if (token) {
      mainHeader.style.marginTop = '100px';
      editionBar.style.display = 'flex';
      filters.style.visibility = 'hidden';
      loginItem.style.display = 'none';
      logoutItem.style.display = 'flex';
      logoutLink.style.color = "#000";
      logoutLink.style.textDecoration="none";
      adminModalButton.style.display = 'flex';
  } else {
      mainHeader.style.marginTop = inherit;
      editionBar.style.display = 'none';
      filters.style.visibility = 'visible';
      loginItem.style.display = 'flex';
      logoutItem.style.display = 'none';
      adminModalButton.style.display = 'none';
  }
  document.getElementById("logout").addEventListener("click", () => {
    sessionStorage.removeItem("token");
    window.location.href = "./index.html";
  });
}
/*-------------------------------------------------------------------------------------------------------------------------------------------*/ 

