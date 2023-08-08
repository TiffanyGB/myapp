const pool = require('../database/configDB');
const motcleModel = require('./motCleModel');
const ressourceModel = require('./ressourceModel');
const gerer = require('./gererProjet');
const { body } = require('express-validator');
const { json } = require('body-parser');
const validationDonnees = require('../middleware/validationDonnees');
const gererProjet = require('../models/gererProjet');
const userModel = require('./userModel');
const { chercherGestionnaireExtID } = require('./gestionnaireExterneModel');
const { chercherGestionnaireIapau } = require('./gestionnaireIaModel');

const validateProjet = [
    body('nom')
        .notEmpty().withMessage('Le nom ne doit pas être vide.')
        .isLength({ min: 2, max: 30 }).withMessage('Le prénom doit avoir une longueur comprise entre 3 et 40 caractères.'),


    body('lienSujet')
        .notEmpty().withMessage('Le lien ne doit pas être vide.')
        .isURL().withMessage('Le lien doit être une url')
        .isLength({ min: 3, max: 500 }).withMessage('Le lien doit avoir une longueur comprise entre 3 et 500 caractères.'),

    body('recompense')
        .notEmpty().withMessage('La récompense ne doit pas être vide.')
        .isInt({ min: 0, max: 100000 }).withMessage('La récompense doit être un nombre entre 0 et 100 000.'),


    body('description')
        .notEmpty().withMessage('La description est obligatoire.')
        .isLength({ min: 5, max: 10000 }).withMessage('La description doit avoir une longueur comprise entre 5 et 10000 caractères.'),

    /**Appel du validateur */
    validationDonnees.validateUserData,
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

    const chercherProjets = `SELECT * FROM Projet WHERE idevent = $1`

    return new Promise((resolve, reject) => {
        pool.query(chercherProjets, [idEvent])
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**Chercher un projet par son id*/
function chercheridProjet(idProjet) {
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

    const inserer = `INSERT INTO Projet (nom, description_projet, recompense, sujet, imgProjet)
      VALUES ($1, $2, $3, $4, $5) RETURNING idProjet`;

    return new Promise((resolve, reject) => {
        pool.query(inserer, valeur_projet)
            .then((result) => {
                const idProjet = result.rows[0].idprojet;
                resolve(idProjet);
            })
            .catch((error) => {
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
    derniereModif = CURRENT_TIMESTAMP,
    imgProjet = $5
    WHERE idProjet = $6`;

    try {
        pool.query(modifier, valeur_projet)

    }
    catch (error) {
        throw error;
    }
}

/**Supprimer un projet */
async function supprimerProjet(idProjet) {

    const supprimer = `DELETE FROM Projet WHERE idProjet = $1`;

    try {
        pool.query(supprimer, [idProjet]);
    } catch (error) {
        throw error;
    }
}

/**JSON avec tous les projets */
async function listeProjetsJson(req) {

    try {
        let projetsListe = await tousLesProjets();

        /*Json contenant les projets existants à renvoyé*/
        let jsonRetour = {};
        jsonRetour.projets = [];
        let gerer_ia = []
        let gerer_ext = [];

        for (i = 0; i < projetsListe.length; i++) {

            projetCourant = projetsListe[i];

            if (req.userProfile === 'gestionnaire') {
                gerer_ia = await gererProjet.chercherGestionnaireIA(projetCourant.idprojet, req.id);
                gerer_ext = await gererProjet.chercherGestionnaireExtID(projetCourant.idprojet, req.id);
            }
            if ((gerer_ia.length > 0 || gerer_ext.length > 0) || req.userProfile === 'admin') {

                temp = {};

                temp.idProjet = projetCourant.idprojet;
                temp.nom = projetCourant.nom;

                if (projetCourant.idevent == null) {
                    temp.idevent = '';
                } else {
                    temp.idevent = projetCourant.idevent;
                }
                temp.description = projetCourant.description_projet;
                temp.derniereModif = projetCourant.dernieremodif;
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

        }
        return jsonRetour;
    }
    catch (error) {
        throw error;
    }
}

/*Crée un json avec toutes les informations dans la bdd d'un evenement sauf la derniere modification */
/*Peut etre l'ajouter? */
async function toutesInfosProjet(projetCourant, projetInfos) {

    if (projetCourant.imgprojet == null) {
        projetInfos.img = '';
    } else {
        projetInfos.img = projetCourant.imgprojet;
    }
    projetInfos.titre = projetCourant.nom;
    projetInfos.idprojet = projetCourant.idprojet;
    projetInfos.description = projetCourant.description_projet;
    projetInfos.recompense = projetCourant.recompense;
    projetInfos.sujet = projetCourant.sujet;
    projetInfos.thematique = [];
    projetInfos.ressources = [];
}

/**Informations d'un projet */
async function infosProjet(idProjet) {

    try {
        let projet = await chercheridProjet(idProjet);

        jsonRetour = {};

        if (projet === 0) {
            json.message = "Aucun projet";
            return 'aucun';
        } else {

            projet = projet[0];

            jsonRetour.id = projet.idprojet;
            jsonRetour.nom = projet.nom;
            jsonRetour.description = projet.description_projet;
            jsonRetour.recompense = projet.recompense;
            jsonRetour.sujet = projet.sujet;
            jsonRetour.derniereModif = projet.dernieremodif;
            jsonRetour.image = projet.imgprojet;

            if (jsonRetour.idevent == null) {
                jsonRetour.idevent = '';
            } else {
                jsonRetour.idevent = projet.idevent;
            }

            if (jsonRetour.idequipegagnante == null) {
                jsonRetour.idEquipeGagnante = '';
            } else {
                jsonRetour.idEquipeGagnante = projet.idequipegagnante;
            }

            const mot = await motcleModel.recupererMot(idProjet);

            jsonRetour.mot = [];

            for (i = 0; i < mot.length; i++) {
                jsonRetour.mot.push(mot[i].mot);
            }

            const ressources = await ressourceModel.recuperer_toutes_ressources(idProjet);

            jsonRetour.ressources = [];

            for (i = 0; i < ressources.length; i++) {
                temp = {};
                temp.nom = ressources[i].titre;
                temp.type = ressources[i].type_ressource;
                temp.lien = ressources[i].lien;
                temp.description = ressources[i].description_ressource;
                temp.statut = ressources[i].statut;
                temp.publication = ressources[i].date_apparition;

                jsonRetour.ressources.push(temp);
            }

            let gestionnaires = await gerer.chercherGestionnaireExt(idProjet);

            jsonRetour.gestionnairesExternes = [];

            for (i = 0; i < gestionnaires.length; i++) {

                let user = (await userModel.chercherUserID(gestionnaires[i].id_g_externe))[0];
                temp = {};

                temp.id = gestionnaires[i].id_g_externe;
                temp.Nom = user.Nom;
                temp.Prenom = user.prenom;
                temp.Mail = user.email;

                user = (await chercherGestionnaireExtID(gestionnaires[i].id_g_externe))[0];
                temp.Entreprise = user.entreprise;
                temp.Metier = user.metier;

                jsonRetour.gestionnairesExternes.push(temp);
            }

            gestionnaires = await gerer.chercherGestionnaireIA(idProjet);

            jsonRetour.gestionnairesIA = [];

            for (i = 0; i < gestionnaires.length; i++) {

                let user = (await userModel.chercherUserID(gestionnaires[i].id_g_iapau))[0];
                temp = {};

                temp.id = gestionnaires[i].id_g_iapau;
                temp.Nom = user.nom;
                temp.Prenom = user.prenom;
                temp.Mail = user.email;

                user = (await chercherGestionnaireIapau(gestionnaires[i].id_g_iapau))[0];
                temp.Entreprise = 'IA-Pau';
                temp.Metier = user.role_asso;

                jsonRetour.gestionnairesIA.push(temp);
            }

            return jsonRetour;
        }
    } catch (error) {
        throw error;
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
        throw error;
    }
}

async function detacherProjetEvent(idEvent) {
    const rattacher = `
      UPDATE Projet 
      SET idevent = null
      WHERE idevent = $1
    `;

    try {
        await pool.query(rattacher, [idEvent]);
    } catch (error) {
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
    chercheridProjet,
    modifierProjet,
    rattacherProjetEvent,
    detacherProjetEvent,
    infosProjet,
    toutesInfosProjet
}