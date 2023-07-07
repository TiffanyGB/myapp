const pool = require('../database/configDB');
const motcleModel = require('./motCleModel');
const ressourceModel = require('./ressourceModel');

/**Liste des projets */
function tousLesProjets(){

    const projets = `SELECT * FROM Projet`;

    return new Promise((resolve, reject) => {
        pool.query(projets)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**Chercher la liste des projets d'un event */
function recuperer_projets(idEvent) {

    const chercherProjets = `SELECT * FROM Projet WHERE idevent = ${idEvent}`

    return new Promise((resolve, reject) => {
        pool.query(chercherProjets)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}



/**Chercher un projet par son id*/


/**Créer un projet */

/**Modifier un projet */

/**Supprimer un projet */

/**Valider les données */


/**JSON avec tous les projets */
async function listeProjetsJson() {

    try {
        let projetsListe = await tousLesProjets();

        if (projetsListe === 0) {
            json.message = "Aucun projet n'existe";
            return 'aucun';
        }
        else {

            let jsonRetour = {};
            jsonRetour.projets = [];

            for (i = 0; i < projetsListe.length; i++) {

                projetCourant = projetsListe[i];

                temp = {}

                temp.idProjet = projetCourant.idprojet;
                temp.nom = projetCourant.nom;
                temp.description = projetCourant.description_projet;
                temp.recompense = projetCourant.recompense;
                temp.image = projetCourant.imgprojet;
                temp.sujet = projetCourant.sujet;
                temp.themes = [];

                const listeMots = await motcleModel.recupererMot(projetCourant.idprojet);

                for (j = 0; j < listeMots.length; j++) {

                    let motCourant = listeMots[j];
                    temp.themes.push(motCourant.mot);
                }

                temp.ressources = [];

                let listeRessource = await ressourceModel.recuperer_toutes_ressources(projetCourant.idprojet);
                console.log
                for (j = 0; j < listeRessource.length; j++) {

                    let ressourceCourante = listeRessource[j];
                    let ressourcesInfos = {};

                    ressourcesInfos.titre = ressourceCourante.titre;
                    ressourcesInfos.type = ressourceCourante.type_ressource;
                    ressourcesInfos.lien = ressourceCourante.lien;
                    ressourcesInfos.description = ressourceCourante.description_ressource;
                    ressourcesInfos.statut = ressourceCourante.statut;

                    temp.ressources.push(ressourcesInfos);

                }
                jsonRetour.projets.push(temp);
            }


            console.log('', jsonRetour);
            return jsonRetour;
        }
    }
    catch {

    }
}







// Pour gérer le lien entre projet et ressources, exemple chat gpt


// Modèle Projet
// const Projet = {
//     // Méthode pour récupérer les ressources d'un projet donné
//     getResources: async function (projetId) {
//       try {
//         // Effectuer une requête à la base de données pour récupérer les ressources du projet
//         const ressources = await db.query('SELECT * FROM ressources WHERE projet_id = ?', [projetId]);
//         return ressources;
//       } catch (error) {
//         throw new Error('Erreur lors de la récupération des ressources du projet');
//       }
//     },
//     // ... Autres méthodes du modèle Projet
//   };
  
//   // Modèle Ressource
//   const Ressource = {
//     // ... Méthodes du modèle Ressource
//   };
  
//   module.exports = { Projet, Ressource };
  

module.exports = {
    tousLesProjets,
    listeProjetsJson,
    recuperer_projets
}