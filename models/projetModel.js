const pool = require('../database/configDB');
const motcleModel = require('./motCleModel');
const ressourceModel = require('./ressourceModel');
const { body, validationResult } = require('express-validator');


/**Valider les données */
function validateUserData(req, res, next) {
    // Exécuter les validateurs Express Validator
    const errors = validationResult(req);

    // Vérifier s'il y a des erreurs de validation
    if (!errors.isEmpty()) {
        // Renvoyer les erreurs de validation au client
        return res.status(400).json({ errors: errors.array() });
    }

    // Si les données sont valides, passer à l'étape suivante
    next();
}


const validateProjet = [
    body('nom')
        .notEmpty().withMessage('Le nom ne doit pas être vide.')
        .isLength({ min: 2, max: 40 }).withMessage('Le prénom doit avoir une longueur comprise entre 3 et 30 caractères.'),


    body('lienSujet')
        .notEmpty().withMessage('Le lien ne doit pas être vide.')
        .isURL().withMessage('Le lien doit être une url')
        .isLength({ min: 2, max: 1000 }).withMessage('Le lien doit avoir une longueur comprise entre 3 et 1000 caractères.'),

    body('recompense')
        .notEmpty().withMessage('La récompense ne doit pas être vide.')
        .isInt({ min: 0, max: 100000 }).withMessage('La récompense doit être un nombre entre 0 et 100 000.'),


    body('description')
        .notEmpty().withMessage('La description est obligatoire.')
        .isLength({ min: 10, max: 1000000 }).withMessage('La description doit avoir une longueur comprise entre 10 et 120 caractères.'),

    /**Appel du validateur */
    validateUserData,
];

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
function chercherProjetId(idProjet) {
    const users = 'SELECT * FROM Projet WHERE idProjet = $1';

    return new Promise((resolve, reject) => {
        pool.query(users, [idProjet])
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}


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
async function modifierProjet(valeur_projet) {

    const modifier = `UPDATE Projet 
    SET nom = $1,
    description_projet = $2,
    recompense = $3,
    sujet = $4,
    derniereModif = CURRENT_TIMESTAMP
    WHERE idProjet = $5`;

    try{
        pool.query(modifier, valeur_projet)

    }
    catch(error){
        throw error;
    }
}

/**Supprimer un projet */
async function supprimerProjet(idProjet) {

    const supprimer = `DELETE FROM Projet WHERE idProjet = $1`;

    return new Promise((resolve, reject) => {

        pool.query(supprimer, [idProjet])
            .then(() => {
                resolve('ok');
            })
            .catch((error) => {
                reject(error);
           });
    });
}


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


async function rattacherProjetEvent(idEvent, idProjet) {
    const rattacher = `
      UPDATE Projet 
      SET idevent = $1
      WHERE idprojet = $2
    `;
  
    try {
      await pool.query(rattacher, [idEvent, idProjet]);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet :', error);
      throw error;
    }
  }
  

module.exports = {
    tousLesProjets,
    listeProjetsJson,
    recuperer_projets,
    creerProjet,
    validateProjet,
    supprimerProjet,
    chercherProjetId,
    modifierProjet,
    rattacherProjetEvent
}