const pool = require('../database/configDB');
const { validateurDonnéesMiddleware } = require('../verifications/validateur');
const userModel = require('./userModel');
const projetModel = require('./projetModel')
const { body } = require('express-validator');
const motCleModel = require('../models/motCleModel');
const gererProjet = require('./gererProjet');
const annotationModel = require('./annotationEquipeModel');
const { recupererJSON } = require('../controllers/gitlabController');
const demandeModel = require('./demandeModel');
const env = require('../environnement.json')
const url_images = env.backend.assets.images;

const validerEquipe = [
    body('nom')
        .notEmpty().withMessage('Le nom ne doit pas être vide.')
        .custom((value) => !(/^\s+$/.test(value)))
        .matches(/^[\W0-9a-zA-ZÀ-ÿ \-']*$/)
        .isLength({ min: 2, max: 30 }).withMessage('Le nom doit avoir une longueur comprise entre 2 et 30 caractères.'),

    body('statut')
        .notEmpty().withMessage('Le statut ne doit pas être vide.')
        .matches(/^(ouvert|fermé)$/).withMessage('Le statut doit être soit "ouvert" soit "fermé".')
        .isLength({ min: 5, max: 6 }).withMessage('Le statut doit avoir une longueur de 6 caractères.'),

    body('description')
        .optional({ nullable: true, checkFalsy: true })
        .custom((value) => !(/^\s+$/.test(value)))
        .isLength({ min: 3, max: 2000 }).withMessage('La description doit avoir une longueur comprise entre 3 et 2000 caractères.'),

    body('lien_discussion')
        .optional({ nullable: true, checkFalsy: true })
        .isURL().withMessage('Le champ conversation doit être un lien valide')
        .isLength({ max: 400 }).withMessage('La taille maximum est de 400 caractères.'),

    body('preferenceQuestionnaire')
        .optional()
        .matches(/^(true|false)$/).withMessage('La préférence doit être soit "true" soit "false".')
        .isLength({ max: 5 }),

    body('idProjet')
        .notEmpty().withMessage('L\'id du projet ne doit pas être vide.')
        .matches(/^[0-9]*$/).withMessage("L\'id ne doit avoir que des chiffres.")
        .isInt({ min: 1, max: 999999999 }).withMessage('L\'id est trop long.'),

    /**Appel du validateur */
    validateurDonnéesMiddleware
];

// /************************************************** C'est à changer dans l'interface ***********/
async function chercherEvenement(idEvent) {

    const users = 'SELECT * FROM Evenement WHERE idEvent = $1';

    try {
        const chercher = await pool.query(users, [idEvent]);
        return chercher.rows;
    } catch (error) {
        throw error;
    }

}

/**
 * Récupère la liste des équipes d'un projet en fonction de l'identifiant du projet.
 * @async
 * @function
 * @param {number} idProjet - L'identifiant du projet pour lequel récupérer les équipes.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau d'objets représentant les équipes.
 * @throws {Error} Une erreur si la récupération des équipes échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function listeEquipeProjet(idProjet) {

    const listeEquipe = `SELECT * FROM Equipe WHERE idProjet = $1`;

    try {
        const chercher = await pool.query(listeEquipe, [idProjet]);
        return chercher.rows;
    } catch (error) {
        throw error;
    }
}

/**
 * Récupère les informations d'une équipe en fonction de son identifiant.
 * @async
 * @function
 * @param {number} id - L'identifiant de l'équipe à rechercher.
 * @returns {Promise<Object>} - Une promesse résolue avec un objet représentant l'équipe trouvée.
 * @throws {Error} Une erreur si la recherche de l'équipe échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function chercherEquipeID(id) {

    const chercher = `SELECT * FROM Equipe WHERE idEquipe = $1`;

    try {
        const res = await pool.query(chercher, [id]);
        return res.rows;
    } catch (error) {
        throw error;
    }
}


/**
 * Récupère la liste des équipes ouvertes (statut de recrutement "ouvert").
 * @async
 * @function
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau d'objets représentant les équipes ouvertes.
 * @throws {Error} Une erreur si la récupération des équipes ouvertes échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function equipesOuvertes() {

    const chercher = `SELECT * FROM Equipe
    WHERE statut_recrutement = 'ouvert'`;
    try {
        const res = await pool.query(chercher);
        return res.rows;
    } catch (error) {
        throw error;
    }
}

/**
 * Ferme une équipe en fonction de son identifiant.
 * @async
 * @function
 * @param {number} idEquipe - L'identifiant de l'équipe à fermer.
 * @throws {Error} Une erreur si la fermeture de l'équipe échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function fermerEquipe(idEquipe) {

    const modifier = `UPDATE Equipe
    SET statut_recrutement = 'fermé'
    WHERE idEquipe = $1`;

    try {
        pool.query(modifier, [idEquipe]);
    } catch (error) {
        throw error;
    }
}

/**
 * Ouvre une équipe en fonction de son identifiant.
 * @async
 * @function
 * @param {number} idEquipe - L'identifiant de l'équipe à ouvrir.
 * @throws {Error} Une erreur si l'ouverture de l'équipe échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function ouvrirEquipe(idEquipe) {

    const modifier = `UPDATE Equipe
    SET statut_recrutement = 'ouvert'
    WHERE idEquipe = $1`;

    try {
        pool.query(modifier, [idEquipe]);
    } catch (error) {
        throw error;
    }
}

/**
 * Récupère les informations d'accès GitLab d'une équipe en fonction de son identifiant.
 * @async
 * @function
 * @param {number} idEquipe - L'identifiant de l'équipe pour laquelle récupérer les informations d'accès GitLab.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau d'objets représentant les informations d'accès GitLab.
 * @throws {Error} Une erreur si la récupération des informations d'accès GitLab échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function chercheraccesGitlab(idEquipe) {
    const chercher = `SELECT login_gitlab, mdp_gitlab
    FROM Equipe
    WHERE idEquipe = $1`;

    try {
        const donnees = await pool.query(chercher, [idEquipe])
        return donnees.rows;
    } catch (error) {
        throw (error);
    }
}

/**
 * Crée une nouvelle équipe en fonction des valeurs fournies.
 * @async
 * @function
 * @param {Array} valeurs - Les valeurs à insérer pour créer l'équipe.
 * @returns {Promise<number>} - Une promesse résolue avec l'identifiant de la nouvelle équipe créée.
 * @throws {Error} Une erreur si la création de l'équipe échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function creerEquipe(valeurs) {

    const inserer = `INSERT INTO Equipe (idCapitaine, nom, description_equipe, statut_recrutement, idProjet)
    VALUES ($1, $2, $3, $4, $5) RETURNING idEquipe`;

    try {
        const res = await pool.query(inserer, valeurs);
        return res.rows[0].idequipe;
    } catch (error) {
        throw error;
    }
}

/**
 * Modifie les informations d'une équipe en fonction des valeurs fournies.
 * @function
 * @param {Array} valeurs - Les valeurs à utiliser pour mettre à jour l'équipe.
 * @throws {Error} Une erreur si la modification de l'équipe échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
function modifierEquipe(valeurs) {

    const modifier = `UPDATE Equipe
    SET nom = $1,
    description_equipe = $2,
    statut_recrutement = $3,
    idProjet = $4,
    lienDiscussion = $5,
    preferenceQuestionnaire = $6,
    lien_github = $7
    WHERE idEquipe = $8`;

    try {
        pool.query(modifier, valeurs);
    } catch (error) {
        throw error;
    }
}

/**
 * Insère les informations d'accès GitLab pour une équipe en fonction des valeurs fournies.
 * @function
 * @param {string} login - Le login GitLab à insérer.
 * @param {string} mdp - Le mot de passe GitLab à insérer.
 * @param {number} idEquipe - L'identifiant de l'équipe pour laquelle insérer les informations d'accès GitLab.
 * @throws {Error} Une erreur si l'insertion des informations d'accès GitLab échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
function insererAccesEquipeGit(login, mdp, idEquipe) {
    const inserer = `UPDATE Equipe 
    SET login_gitlab = $1,
    mdp_gitlab = $2
    WHERE idEquipe = $3`;

    try {
        pool.query(inserer, [login, mdp, idEquipe])
    } catch (error) {
        throw error;
    }
}

/**
 * Vérifie si un utilisateur appartient à une équipe en fonction des identifiants de l'utilisateur et de l'équipe.
 * @async
 * @function
 * @param {number} idUser - L'identifiant de l'utilisateur à vérifier.
 * @param {number} idEquipe - L'identifiant de l'équipe à vérifier.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau d'objets représentant l'appartenance de l'utilisateur à l'équipe.
 * @throws {Error} Une erreur si la vérification de l'appartenance à l'équipe échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function appartenirEquipe(idUser, idEquipe) {

    const chercher = `SELECT * FROM Appartenir 
    WHERE idEquipe = $1 AND idUser = $2`;

    try {
        const res = await pool.query(chercher, [idEquipe, idUser]);
        return res.rows;
    } catch (error) {
        throw (error);
    }
}

/**
 * Récupère la liste des membres d'une équipe en fonction de l'identifiant de l'équipe.
 * @async
 * @function
 * @param {number} idEquipe - L'identifiant de l'équipe pour laquelle récupérer la liste des membres.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau d'objets représentant les membres de l'équipe.
 * @throws {Error} Une erreur si la récupération de la liste des membres de l'équipe échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function ListeMembre(idEquipe) {

    const chercher = `SELECT idUser FROM Appartenir 
    WHERE idEquipe = $1`;

    try {
        const res = await pool.query(chercher, [idEquipe]);
        return res.rows;
    } catch (error) {
        throw (error);
    }
}

/**
 * Ajoute un membre à une équipe en fonction des identifiants de l'utilisateur et de l'équipe.
 * @function
 * @param {number} idUser - L'identifiant de l'utilisateur à ajouter à l'équipe.
 * @param {number} idEquipe - L'identifiant de l'équipe à laquelle ajouter le membre.
 * @throws {Error} Une erreur si l'ajout du membre à l'équipe échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
function ajouterMembre(idUser, idEquipe) {

    let inserer = `INSERT INTO Appartenir (idUser, idEquipe)
        VALUES ($1, $2)`;

    try {
        pool.query(inserer, [idUser, idEquipe]);
    } catch (error) {
        throw error
    }

}

/**
 * Supprime un membre d'une équipe en fonction des identifiants de l'utilisateur et de l'équipe.
 * @function
 * @param {number} idUser - L'identifiant de l'utilisateur à supprimer de l'équipe.
 * @param {number} idEquipe - L'identifiant de l'équipe de laquelle supprimer le membre.
 * @throws {Error} Une erreur si la suppression du membre de l'équipe échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
function supprimerUnMembre(idUser, idEquipe) {

    let supprimer = `DELETE FROM Appartenir 
    WHERE idUser = $1 AND idEquipe = $2`;

    try {
        pool.query(supprimer, [idUser, idEquipe]);
    } catch (error) {
        throw error
    }
}

/**
 * Supprime une équipe en fonction de son identifiant.
 * @function
 * @param {number} idEquipe - L'identifiant de l'équipe à supprimer.
 * @throws {Error} Une erreur si la suppression de l'équipe échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
function supprimerEquipe(idEquipe) {

    const supprimer = `DELETE FROM Equipe 
    WHERE idEquipe = $1`;

    try {
        pool.query(supprimer, [idEquipe]);
    } catch (error) {
        throw error;
    }
}

/**
 * Fait quitter un membre d'une équipe en fonction des identifiants de l'utilisateur et de l'équipe.
 * @function
 * @param {number} idEquipe - L'identifiant de l'équipe dont le membre doit quitter.
 * @param {number} idMembre - L'identifiant de l'utilisateur qui doit quitter l'équipe.
 * @throws {Error} Une erreur si le membre ne peut pas quitter l'équipe.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
function quitterEquipe(idEquipe, idMembre) {

    const quitter = `DELETE FROM Appartenir
    WHERE idEquipe = $1 AND idUser = $2`;

    try {
        pool.query(quitter, [idEquipe, idMembre]);
    } catch (error) {
        throw error;
    }
}

/**
 * Récupère les demandes d'équipe en fonction de l'identifiant de l'équipe.
 * @async
 * @function
 * @param {number} idEquipe - L'identifiant de l'équipe pour laquelle récupérer les demandes.
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau d'objets représentant les demandes d'équipe.
 * @throws {Error} Une erreur si la récupération des demandes d'équipe échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function recupererDemande(idEquipe) {

    const chercher = `SELECT * FROM DemandeEquipe 
    WHERE idEquipe = $1`;

    try {
        const res = await pool.query(chercher, [idEquipe]);
        return res.rows;
    } catch (error) {
        throw (error);
    }
}


/**
 * Vérifie si un utilisateur appartient à au moins une équipe 
 * dans un événement en fonction de son identifiant de celui de l'événement.
 * @async
 * @function
 * @param {number} idEtudiant - L'identifiant de l'utilisateur à vérifier.
 * @param {number} idEvent - Identifiant de l'événement
 * @returns {Promise<Array>} - Une promesse résolue avec un tableau d'objets représentant l'appartenance de l'utilisateur à des équipes.
 * @throws {Error} Une erreur si la vérification de l'appartenance à une équipe échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function aUneEquipeDansEvent(idUser, idEvent) {
    try {

        const projets_event = await projetModel.recuperer_projets(idEvent);

        for (i = 0; i < projets_event.length; i++) {
            const equipes_projets = await listeEquipeProjet(projets_event[i].idprojet);

            for (j = 0; j < equipes_projets.length; j++) {
                let appartenir = await appartenirEquipe(idUser, equipes_projets[j].idequipe);

                if (appartenir.length > 0) {

                    return appartenir[0].idequipe;
                }
            }
        }
        return -1;
    } catch (error) {
        throw error;
    }
}

/**
 * Promouvoir un membre de l'équipe au poste de capitaine en fonction des identifiants de l'équipe et de l'étudiant.
 * @function
 * @param {number} idEquipe - L'identifiant de l'équipe.
 * @param {number} idEtudiant - L'identifiant de l'étudiant à promouvoir en tant que capitaine.
 * @throws {Error} Une erreur si la promotion du capitaine échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
function promouvoir(idEquipe, idEtudiant) {

    const promouvoir = `UPDATE Equipe
    SET idCapitaine = $1
    WHERE idEquipe = $2`;

    try {
        pool.query(promouvoir, [idEtudiant, idEquipe]);
    } catch (error) {
        throw (error);
    }
}

/**
 * Récupère les informations d'une équipe au format JSON en fonction de son identifiant et de la requête utilisateur.
 * Selon le profil de l'utilisateur, des informations sont présentes en plus.
 * 
 * Voir le profil, d'une équipe et pour la modif
 *Si c'est un etudiant lambda ou gestionnaire (qui ne gère pas le projet de l'équipe), voir le minimum
 *si membre/gestionnaire de l'équipe ou admin voir tout
 * @async
 * @function
 * @param {number} idEquipe - L'identifiant de l'équipe pour laquelle récupérer les informations.
 * @param {object} req - La requête utilisateur.
 * @returns {Promise<object>} - Une promesse résolue avec un objet représentant les informations de l'équipe au format JSON.
 * @throws {Error} Une erreur si la récupération des informations de l'équipe échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function jsonInformationsEquipe(idEquipe, req) {

    try {
        const chercher = await chercherEquipeID(idEquipe);

        jsonRetour = {}
        let voirTout;

        let temp1 = chercher[0];

        /*Nom*/
        jsonRetour.nom = temp1.nom;

        /*Nombre de membres de l'équipe */
        const membres = await ListeMembre(idEquipe);
        jsonRetour.nombre_membres = membres.length;

        /*Nombre max de l'event*/
        const projet = await projetModel.chercheridProjet(temp1.idprojet);
        let idevent = projet[0].idevent;

        const event = await chercherEvenement(idevent);
        jsonRetour.nombre_max_membres = event[0].nombre_max_equipe;

        const minimum = event[0].nombre_min_equipe;

        if (membres.length >= minimum) {
            jsonRetour.valide = true;
        } else {
            jsonRetour.valide = false;
        }

        /* Equipe ouverte ou fermée */
        jsonRetour.statutRecrutement = temp1.statut_recrutement;

        /* Description */
        if (temp1.description_equipe == null) {
            jsonRetour.profilRecherche = "";
        } else {
            jsonRetour.profilRecherche = temp1.description_equipe;
        }

        let temp;
        /* Infos capitaine */
        jsonRetour.capitaine = {};

        let capitaine = await userModel.chercherUserID(temp1.idcapitaine);
        jsonRetour.capitaine.id = temp1.idcapitaine;

        jsonRetour.capitaine.pseudo = capitaine[0].pseudo;
        jsonRetour.capitaine.email = capitaine[0].email;

        /* Infos des membres, id et pseudo */
        jsonRetour.membres = [];

        for (i = 0; i < membres.length; i++) {

            membreCourant = membres[i];

            if (membreCourant.iduser != temp1.idcapitaine) {
                temp = {};
                temp.id = membreCourant.iduser;

                let user = await userModel.chercherUserID(membreCourant.iduser);

                temp.pseudo = user[0].pseudo;

                jsonRetour.membres.push(temp);
            }
        }

        /* Infos projet */
        jsonRetour.sujet = {};

        jsonRetour.sujet.titre = projet[0].nom;
        jsonRetour.sujet.id_projet = projet[0].idprojet;
        jsonRetour.sujet.description = projet[0].description_projet;
        jsonRetour.sujet.lien_sujet = projet[0].sujet;
        jsonRetour.sujet.image = url_images + "/" + projet[0].imgprojet;
        jsonRetour.sujet.mots = [];

        let listeMots = await motCleModel.recupererMot(projet[0].idprojet);

        for (j = 0; j < listeMots.length; j++) {

            let motCourant = listeMots[j];
            jsonRetour.sujet.mots.push(motCourant.mot);
        }

        if (req.userProfile === 'gestionnaire') {
            const gerer_ia = await gererProjet.chercherGestionnaireIA(projet[0].idprojet, req.id);
            const gerer_ext = await gererProjet.chercherGestionnaireExtID(projet[0].idprojet, req.id);

            if ((gerer_ia.length > 0) || (gerer_ext.length > 0)) {
                jsonRetour.superUser = true;
                voirTout = true;

            } else {
                jsonRetour.superUser = false;
            }
        } else if (req.userProfile === 'admin') {
            jsonRetour.superUser = true;
            voirTout = true;
        } else {
            jsonRetour.superUser = false;
        }

        const demandeFaite = await demandeModel.demandeDejaEnvoyee(req.id, idEquipe);
        if (demandeFaite.length === 0) {
            jsonRetour.demandeFaite = false;
        } else {
            jsonRetour.demandeFaite = true;
        }

        if (req.userProfile === 'etudiant') {
            const etudiant = await appartenirEquipe(req.id, idEquipe);

            if (etudiant.length === 0) {
                jsonRetour.dansEquipe = false;
                return jsonRetour;
            }
            jsonRetour.dansEquipe = true;
            voirTout = true;
        }

        if (!voirTout) {
            return jsonRetour;
        }

        if (jsonRetour.capitaine.id === req.id) {
            jsonRetour.estCapitaine = true;

        } else {
            jsonRetour.estCapitaine = false;
        }

        jsonRetour.reponseQuestionAll = temp1.preferencequestionnaire;

        if (temp1.lien_github == null) {
            jsonRetour.git = '';
        } else {
            jsonRetour.git = temp1.lien_github;
        }

        if (temp1.liendiscussion == null) {
            jsonRetour.lien_discussion = '';
        } else {
            jsonRetour.lien_discussion = temp1.liendiscussion;
        }

        /*liste projet event pour modifier le choix*/
        jsonRetour.liste_projets_event = [];

        const listeProjetEvent = await projetModel.recuperer_projets(idevent);

        for (i = 0; i < listeProjetEvent.length; i++) {

            temp = {};

            if (temp1.idprojet != listeProjetEvent[i].idProjet) {
                temp = {};
                temp.id_projet = listeProjetEvent[i].idprojet;
                temp.titre = listeProjetEvent[i].nom;
                temp.description = listeProjetEvent[i].description_projet;
                temp.lien_sujet = listeProjetEvent[i].sujet;
                temp.mots = [];

                listeMots = await motCleModel.recupererMot(listeProjetEvent[i].idprojet);

                for (j = 0; j < listeMots.length; j++) {

                    let motCourant = listeMots[j];
                    temp.mots.push(motCourant.mot);
                }

                jsonRetour.liste_projets_event.push(temp);
            }
        }

        //Liste user en attente, id, pseudo, message
        const demande = await recupererDemande(idEquipe);

        jsonRetour.liste_user_attente = [];

        for (i = 0; i < demande.length; i++) {

            temp = {};
            temp.id = demande[i].iduser;

            user = await userModel.chercherUserID(demande[i].iduser);

            temp.pseudo = user[0].pseudo;

            if (demande[i].messagedemande == null) {
                temp.message = '';
            } else {
                temp.message = demande[i].messagedemande;
            }
            jsonRetour.liste_user_attente.push(temp);
        }

        const result = await recupererJSON(idEquipe, event[0].nom);
        jsonRetour.resultats = [];

        for (i = 0; i < result.length; i++) {
            let temp = {};

            temp.result = 'success'
            temp.content = JSON.stringify(result[i]);
            temp.date = result[i].end;

            jsonRetour.resultats.push(temp)
        }

        /*Accès à gitlab */
        const acces = (await chercheraccesGitlab(idEquipe))[0];
        jsonRetour.acces_gitlab = [];
        temp = {};
        temp.login = acces.login_gitlab;
        temp.mot_de_passe = acces.mdp_gitlab;
        // temp.login = 'acces.login_gitlab';
        // temp.mot_de_passe = 'acces.mdp_gitlab';
        temp.lien_gitlab = env.app.computationImpact.gitlab.host;
        jsonRetour.acces_gitlab.push(temp);

        return jsonRetour;
    }
    catch (error) {
        throw error;
    }
}

/**
 * Récupère la liste des équipes associées à un projet au format JSON en fonction de l'identifiant du projet.
 * @async
 * @function
 * @param {number} idProjet - L'identifiant du projet pour lequel récupérer la liste des équipes.
 * @returns {Promise<object>} - Une promesse résolue avec un objet représentant la liste des équipes au format JSON.
 * @throws {Error} Une erreur si la récupération de la liste des équipes échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function jsonListeEquipeProjet(idProjet) {

    try {
        const equipeList = await listeEquipeProjet(idProjet);
        jsonRetour = {};
        jsonRetour.equipe = [];

        for (i = 0; i < equipeList.length; i++) {

            equipeCourante = equipeList[i];

            temp = {};

            /*Equipe*/
            temp.id = equipeCourante.idequipe;
            temp.nom = equipeCourante.nom;

            /*Nombre de membres de l'équipe */
            const membres = await ListeMembre(temp.id);
            temp.nombreMembre = membres.length;

            /*Projet */
            temp.idProjet = idProjet;
            const projet = (await projetModel.chercheridProjet(idProjet))[0];
            temp.nomProjet = projet.nom;

            /*Nombres de personnes suffisantes pour participer*/
            let idevent = projet.idevent;
            const event = (await chercherEvenement(idevent))[0];

            if (temp.nombreMembre >= event.nombre_min_equipe) {
                temp.valide = true;
            } else {
                temp.valide = false;
            }
            temp.nombreMaxEquipe = event.nombre_max_equipe;
            temp.nomEvent = event.nom;
            temp.idEvent = event.idevent;

            /*Dernier suivi de l'équipe */
            let annotations = await annotationModel.getAnnotationEquipes(equipeCourante.idequipe);
            if (annotations.length === 0) {
                temp.dernierSuivi = event.date_creation;
            } else {
                annotations.sort((a, b) => new Date(b.date_annotation) - new Date(a.date_annotation));
                temp.dernierSuivi = annotations[0].date_annotation;
            }

            /*Capitaine */
            temp.idCapitaine = equipeCourante.idcapitaine;
            temp.pseudoCapitaine = ((await userModel.chercherUserID(equipeCourante.idcapitaine))[0].pseudo);

            const result = await recupererJSON(equipeCourante.idequipe, event.nom);
            temp.resultats = [];

            for (i = 0; i < result.length; i++) {
                let temp2 = {};
                temp2.result = 'success';
                temp2.content = JSON.stringify(result[i]);
                temp2.date = result[i].end;

                temp.resultats.push(temp2)
            }
            jsonRetour.equipe.push(temp);
        }
        return jsonRetour;
    } catch (error) {
        throw error;
    }
}

/**
 * Récupère les équipes auxquelles un étudiant appartient au format JSON en fonction de son identifiant.
 * @async
 * @function
 * @param {number} idUser - L'identifiant de l'étudiant pour lequel récupérer les équipes.
 * @returns {Promise<object>} - Une promesse résolue avec un objet représentant les équipes auxquelles l'étudiant appartient au format JSON.
 * @throws {Error} Une erreur si la récupération des équipes de l'étudiant échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function jsonMesEquipes(idUser) {

    let jsonRetour = {};
    jsonRetour.equipe = [];

    const mesEquipes = await aUneEquipe(idUser);

    for (i = 0; i < mesEquipes.length; i++) {

        let idEquipeCourante = mesEquipes[i].idequipe;
        let equipeCouranteInfos = (await chercherEquipeID(idEquipeCourante))[0];

        temp = {};

        /*Equipe */
        temp.id = idEquipeCourante;
        temp.nom = equipeCouranteInfos.nom;

        /*Nombre de membres de l'équipe */
        const membres = await ListeMembre(temp.id);
        temp.nombreMembre = membres.length;

        /*Projet */
        temp.idProjet = equipeCouranteInfos.idprojet;
        const projet = (await projetModel.chercheridProjet(temp.idProjet))[0];
        temp.nomProjet = projet.nom;

        /*Capitaine */
        if (equipeCouranteInfos.idcapitaine === idUser) {
            temp.estCapitaine = true;

        } else {
            temp.estCapitaine = false;

        }
        temp.nomCapitaine = ((await userModel.chercherUserID(equipeCouranteInfos.idcapitaine))[0].nom);

        /*Nombres de personnes suffisantes pour participer*/
        let idevent = projet.idevent;
        const event = (await chercherEvenement(idevent))[0];

        temp.nombre_max_equipe = event.nombre_max_equipe;
        temp.nomEvent = event.nom;

        if (new Date(event.date_fin) < new Date()) {
            temp.fini = true;
        } else {
            temp.fini = false;
        }
        jsonRetour.equipe.push(temp);
    }
    return jsonRetour;
}

/**
 * Récupère les équipes ouvertes d'un événement au format JSON en fonction de l'identifiant de l'événement et de la requête utilisateur.
 * Quelques informations de l'équipe sont renvoyées comme le pseudo du capitaine ou le nom de l'équipe.
 * Mais aussi, si l'étudiant a déjà envoyé une demande d'admission.
 * @async
 * @function
 * @param {number} idEvent - L'identifiant de l'événement pour lequel récupérer les équipes ouvertes.
 * @param {object} req - La requête utilisateur.
 * @returns {Promise<object>} - Une promesse résolue avec un objet représentant les équipes ouvertes au format JSON.
 * @throws {Error} Une erreur si la récupération des équipes ouvertes échoue.
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 */
async function jsonEquipesOuvertes(idEvent, req) {

    jsonRetour = {};
    jsonRetour.equipes = [];

    const projet_event = await projetModel.recuperer_projets(idEvent);

    let listeEquipes;

    for (i = 0; i < projet_event.length; i++) {

        listeEquipes = await listeEquipeProjet(projet_event[i].idprojet);

        for (j = 0; j < listeEquipes.length; j++) {
            if (listeEquipes[j].statut_recrutement === 'ouvert') {
                temp = {};
                temp.idEquipe = listeEquipes[j].idequipe;
                temp.nom = listeEquipes[j].nom;

                /*Nom du proejt */
                const nomProjet = await projetModel.chercheridProjet(listeEquipes[j].idprojet);
                temp.projet = nomProjet[0].nom;
                temp.lienProjet = nomProjet[0].sujet;

                /*Infos du capitaine */
                temp.capitaine = {};
                const capitaine = await userModel.chercherUserID(listeEquipes[j].idcapitaine);
                temp.capitaine.pseudo = capitaine[0].pseudo;
                temp.capitaine.idCapitaine = capitaine[0].iduser;

                /*Nombre de membres de l'équipe */
                const membres = await ListeMembre(listeEquipes[j].idequipe);
                temp.nbMembres = membres.length;

                /*Nombre de membres max */
                let idevent = nomProjet[0].idevent;

                const event = (await chercherEvenement(idevent))[0];
                temp.maxNbMembres = event.nombre_max_equipe;

                /*Nombres de personnes suffisantes pour participer*/
                if (temp.nbMembres >= event.nombre_min_equipe) {
                    temp.teamValide = true;
                } else {
                    temp.teamValide = false;
                }

                /* Vérifier si une demande a déjà été envoyée */
                const envoyee = await demandeModel.demandeDejaEnvoyee(req.id, temp.idEquipe);
                if (envoyee.length > 0) {
                    temp.hasSentDemand = true;
                } else {
                    temp.hasSentDemand = false;
                }

                jsonRetour.equipes.push(temp);
            }
        }
    }
    return jsonRetour;
}

module.exports = {
    jsonListeEquipeProjet,
    promouvoir,
    supprimerEquipe,
    creerEquipe,
    listeEquipeProjet,
    chercherEquipeID,
    validerEquipe,
    ajouterMembre,
    modifierEquipe,
    equipesOuvertes,
    jsonEquipesOuvertes,
    jsonInformationsEquipe,
    supprimerUnMembre,
    quitterEquipe,
    appartenirEquipe,
    jsonMesEquipes,
    aUneEquipeDansEvent,
    fermerEquipe,
    ouvrirEquipe,
    ListeMembre,
    insererAccesEquipeGit
}