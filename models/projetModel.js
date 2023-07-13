const pool = require('../database/configDB');
const motcleModel = require('./motCleModel');
const ressourceModel = require('./ressourceModel');

/**Valider les données */


/**Liste des projets */
function tousLesProjets() {

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
async function creerProjet(valeur_projet) {
    const inserer = `INSERT INTO Projet (nom, description_projet, recompense, sujet)
      VALUES ($1, $2, $3, $4) RETURNING idProjet`;
  
    return new Promise((resolve, reject) => {
      pool.query(inserer, valeur_projet)
        .then((result) => {
          const idProjet = result.rows[0].idprojet;
          console.log(idProjet);
          resolve(idProjet);
        })
        .catch((error) => {
          console.error('Erreur lors de l\'insertion des données côté étudiant :', error);
          reject(error);
        });
    });
  }
  

/**Modifier un projet */

/**Supprimer un projet */



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


module.exports = {
    tousLesProjets,
    listeProjetsJson,
    recuperer_projets, 
    creerProjet
}