let tabProjet = [];
let tabRessources = [];


function creerTableauProjet(){

    // Récupérer les valeurs saisies pour le projet en cours
    const nomProjet = document.getElementById("nomProjet").value;
    const descriptionProjet = document.getElementById("descriptionProjet").value;
    const imageProjet = document.getElementById("imageProjet").value;
    const recompense = document.getElementById("recompense").value;

    // Créer un objet pour représenter le projet
    const projet = {
        nom: nomProjet,
        description: descriptionProjet,
        image: imageProjet,
        recompense: recompense,
    };

    tabProjet.push(projet);
    for(i= 0; i < tabProjet.length; i++){
        console.log(tabProjet[i])
    }

}

function creerTableauRessources(){

    // Récupérer les valeurs saisies pour le projet en cours
    const titreRessource = document.getElementById("titreRessource").value;
    const descriptionRessource = document.getElementById("descriptionRessource").value;
    const typeRessources = document.getElementById("typeRessources").value;
    const statut = document.getElementById("statut").value;
    const lien = document.getElementById("lien").value;
    const dateApparition = document.getElementById("dateApparition").value;

    // Créer un objet pour représenter le projet
    const projet = {
        titre: titreRessource,
        descriptionRessource: descriptionRessource,
        type: typeRessources,
        statut: statut,
        lien: lien,
        date: dateApparition,
    };

    tabRessources.push(projet);
    for(i= 0; i < tabRessources.length; i++){
        console.log(tabRessources[i])
    }
} 

function envoyerDonnees(event) {
    // Empêcher l'envoi du formulaire par défaut
    event.preventDefault(); 
  
    // Envoyer les tableaux au serveur via une requête AJAX
    axios.post('/admin/creerEvent', {
      projet: tabProjet,
      ressources: tabRessources
    })
    .then(function (response) {
      // Traiter la réponse du serveur
      console.log(response);
    })
    .catch(function (error) {
      // Gérer les erreurs de requête
      console.log(error);
    });
  }