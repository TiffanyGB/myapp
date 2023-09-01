const pool = require('../database/configDB');
const motcleModel = require('./motCleModel');
const ressourceModel = require('./ressourceModel');
const gerer = require('./gererProjet');
const { body } = require('express-validator');
const { json } = require('body-parser');
const { validateurDonnéesMiddleware } = require('../verifications/validateur');
const gererProjet = require('../models/gererProjet');
const userModel = require('./userModel');
const { chercherGestionnaireExtID } = require('./gestionnaireExterneModel');
const { chercherGestionnaireIapau } = require('./gestionnaireIaModel');
const env = require('../environnement.json');
const img_url = env.backend.assets.images;


const validateProjet = [
    body('nom')
        .notEmpty().withMessage('Le nom ne doit pas être vide.')
        .custom((value) => !(/^\s+$/.test(value))).withMessage('Le nom ne doit pas être vide.')
        .isLength({ min: 2, max: 30 }).withMessage('Le nom doit avoir une longueur comprise entre 3 et 40 caractères.'),


    body('lienSujet')
        .notEmpty().withMessage('Le lien ne doit pas être vide.')
        .isURL().withMessage('Le lien doit être une url')
        .isLength({ min: 3, max: 500 }).withMessage('Le lien doit avoir une longueur comprise entre 3 et 500 caractères.'),

    body('recompense')
        .notEmpty().withMessage('La récompense ne doit pas être vide.')
        .custom((value) => !(/^\s+$/.test(value)))
        .isLength({ min: 0, max: 100000 }).withMessage('La récompense doit être un nombre entre 0 et 100 000.'),


    body('description')
        .notEmpty().withMessage('La description est obligatoire.')
        .custom((value) => !(/^\s+$/.test(value))).withMessage('La description ne doit pas être vide.')
        .isLength({ min: 5, max: 10000 }).withMessage('La description doit avoir une longueur comprise entre 5 et 10000 caractères.'),
    body('template')
        .notEmpty().withMessage('Le template est obligatoire.')
        .isURL()
        .isLength({ max: 1000 }).withMessage('La description doit avoir une longueur de 1000 caractères maximum.'),

    /*Appel du validateur */
    validateurDonnéesMiddleware
];


/**
 * Récupère la liste de tous les projets.
 * @async
 * @function
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau de tous les projets.
 * @throws {Error} Une erreur si la récupération des projets échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function tousLesProjets() {

    const projets = `SELECT * FROM Projet`;

    try {
        const chercher = await pool.query(projets);
        return chercher.rows;
    } catch {
        throw (error);
    }

}

/**
 * Récupère la liste des projets associés à un événement en fonction de son identifiant.
 * @async
 * @function
 * @param {number} idEvent - Identifiant de l'événement.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau des projets associés à l'événement.
 * @throws {Error} Une erreur si la récupération des projets échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function recuperer_projets(idEvent) {

    const chercherProjets = `SELECT * FROM Projet WHERE idevent = $1`

    try {
        const chercher = await pool.query(chercherProjets, [idEvent]);
        return chercher.rows;
    } catch {
        throw (error);
    }
}

/**
 * Recherche un projet par son identifiant.
 * @async
 * @function
 * @param {number} idProjet - Identifiant du projet.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau contenant les informations du projet trouvé.
 * @throws {Error} Une erreur si la recherche du projet échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function chercheridProjet(idProjet) {
    const users = 'SELECT * FROM Projet WHERE idProjet = $1';

    try {
        const chercher = await pool.query(users, [idProjet]);
        return chercher.rows;
    } catch {
        throw (error);
    }
}

/**
 * Recherche un projet par son identifiant.
 * @async
 * @function
 * @param {number} idProjet - Identifiant du projet.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau contenant les informations du projet trouvé.
 * @throws {Error} Une erreur si la recherche du projet échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function creerProjet(valeur_projet) {

    const inserer = `INSERT INTO Projet (nom, description_projet, recompense, sujet, imgProjet, template)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING idProjet`;

    try {
        const chercher = await pool.query(inserer, valeur_projet);
        return chercher.rows[0].idprojet;
    } catch (error) {
        throw (error);
    }
}

/**
 * Crée un nouveau projet avec les informations fournies.
 * @async
 * @function
 * @param {Array} valeur_projet - Un tableau contenant les nouvelles valeurs du projet : [nom, description_projet, recompense, sujet, imgProjet, template].
 * @returns {Promise<number>} - Une promesse résolue avec l'identifiant du nouveau projet créé.
 * @throws {Error} Une erreur si la création du projet échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
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

/**
 * Modifie les informations d'un projet en fonction des valeurs fournies.
 * @async
 * @function
 * @param {Array} valeur_projet - Un tableau contenant les nouvelles valeurs du projet : [nom, description_projet, recompense, sujet, imgProjet, idProjet].
 * @throws {Error} Une erreur si la modification du projet échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function supprimerProjet(idProjet) {

    const supprimer = `DELETE FROM Projet WHERE idProjet = $1`;

    try {
        pool.query(supprimer, [idProjet]);
    } catch (error) {
        throw error;
    }
}

/**
 * Génère un objet JSON contenant la liste des projets en fonction des informations de la requête.
 * @async
 * @function
 * @param {Object} req - Objet de requête contenant les informations nécessaires.
 * @returns {Promise<Object>} - Une promesse résolue avec un objet JSON contenant la liste des projets filtrée.
 * @throws {Error} Une erreur si la génération de la liste de projets échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
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
                gerer_ia = await gererProjet.chercherGestionnaireIAID(projetCourant.idprojet, req.id);
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
                temp.image = img_url + "/" + projetCourant.imgprojet;
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


/**
 * Génère un objet JSON contenant les informations détaillées d'un projet en fonction de son identifiant.
 * @async
 * @function
 * @param {Object} projetCourant - Objet contenant les informations de projet.
 * @param {Object} projetInfos - Objet dans lequel stocker les informations détaillées du projet.
 * @throws {Error} Une erreur si la génération des informations détaillées du projet échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function toutesInfosProjet(projetCourant, projetInfos) {

    if (projetCourant.imgprojet == null) {
        projetInfos.img = '';
    } else {
        projetInfos.img = img_url + "/" + projetCourant.imgprojet;
    }
    projetInfos.titre = projetCourant.nom;
    projetInfos.idprojet = projetCourant.idprojet;
    projetInfos.description = projetCourant.description_projet;
    projetInfos.recompense = projetCourant.recompense;
    projetInfos.sujet = projetCourant.sujet;
    projetInfos.thematique = [];
    projetInfos.ressources = [];
}

/**
 * Récupère toutes les informations d'un projet en fonction de son identifiant.
 * @async
 * @function
 * @param {number} idProjet - Identifiant du projet.
 * @returns {Promise<Object>} - Une promesse résolue avec un objet contenant toutes les informations du projet.
 * @throws {Error} Une erreur si la récupération des informations du projet échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
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

            if (jsonRetour.image == null) {
                jsonRetour.image = '';
            } else {
                jsonRetour.image = projet.imgprojet;
            }

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
                temp.Nom = user.nom;
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

/**
 * Attache un projet à un événement en fonction de leurs identifiants respectifs.
 * @async
 * @function
 * @param {number} idEvent - Identifiant de l'événement.
 * @param {number} idProjet - Identifiant du projet à attacher à l'événement.
 * @throws {Error} Une erreur si l'attache du projet à l'événement échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
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

/**
 * Détache un projet d'un événement en fonction de l'identifiant de l'événement.
 * @async
 * @function
 * @param {number} idEvent - Identifiant de l'événement dont le projet doit être détaché.
 * @throws {Error} Une erreur si la détache du projet de l'événement échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
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