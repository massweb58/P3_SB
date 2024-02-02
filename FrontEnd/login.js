/*Gère la connexion, envoie les données du login, et redirige vers les projets ou affiche une erreur. */

document.getElementById("form-login").addEventListener("submit", function (event) {
    event.preventDefault();

    /*Récupère les valeurs @ et de MDP des champs de formulaire et on stocke dans un objet (data) */

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const data = {
        email: email,
        password: password
    };
 
    /*Envoie les données de connexion à l'API, gère la réponse pour l'authentification ou affiche des messages d'erreur. */
    
    fetch('http://localhost:5678/api/users/login', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Erreur dans l’identifiant ou le mot de passe");
        }
    })
    .then(login => {
        if (login.token) {
            sessionStorage.setItem("token", login.token); 
            window.location.href = "./index.html";
            displayWorks(categorieId);
        } else {
            document.getElementById("erreur-message").innerText = "Problème de récupération du token.";
        }
    })
    .catch(error => {
        console.error(error);
        document.getElementById("erreur-message").innerText = error.message;
    });
});

