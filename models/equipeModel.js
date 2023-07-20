const pool = require('../database/configDB');
const validationDonnees = require('../middleware/validationDonnees');
const { body } = require('express-validator');

const validerEquipe = [
    body('nom')
        .notEmpty().withMessage('Le nom ne doit pas être vide.')
        .matches(/^[\W0-9a-zA-ZÀ-ÿ \-']*$/)
        .isLength({ min: 2, max: 30 }).withMessage('Le prénom doit avoir une longueur comprise entre 2 et 30 caractères.'),

    body('statut')
        .notEmpty().withMessage('Le statut ne doit pas être vide.')
        .matches(/^(ouvert|fermé)$/).withMessage('Le statut doit être soit "ouvert" soit "fermé".')
        .isLength({ min: 5, max: 6 }).withMessage('Le statut doit avoir une longueur de 6 caractères.'),


    body('description')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 10, max: 2000 }).withMessage('Le pseudo doit avoir une longueur comprise entre 3 et 2000 caractères.'),

    body('idCapitaine')
        .notEmpty().withMessage('L\'id ne doit pas être vide.')
        .matches(/^[0-9]*$/).withMessage("L\'id ne doit avoir que des chiffres.")
        .isLength({ min: 1, max: 10000 }),

    body('idProjet')
        .notEmpty().withMessage('Le prénom ne doit pas être vide.')
        .matches(/^[0-9]*$/).withMessage("L\'id ne doit avoir que des chiffres.")
        .isLength({ min: 1, max: 10000 }),

    /**Appel du validateur */
    validationDonnees.validateUserData,
];

async function listeEquipeProjet(idProjet) {

    const chercher = `SELECT * FROM Equipe WHERE idProjet = $1`;

    return new Promise((resolve, reject) => {
        pool.query(chercher, [idProjet])
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

async function chercherEquipeID(id) {

    const chercher = `SELECT * FROM Equipe WHERE idEquipe = $1`;

    return new Promise((resolve, reject) => {
        pool.query(chercher, [id])
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

async function creerEquipe(valeurs) {

    const inserer = `INSERT INTO Equipe (idCapitaine, nom, description_equipe, statut_recrutement, idProjet)
    VALUES ($1, $2, $3, $4, $5) RETURNING idEquipe`;

    try {
        return new Promise((resolve, reject) => {
            pool.query(inserer, valeurs)
                .then((result) => {
                    let id = result.rows[0].idequipe;
                    resolve(id);
                })
        });
    } catch (error) {
        throw error;
    }
}

function modifierEquipe(valeurs) {

    const modifier = `UPDATE Equipe
    SET nom = $1,
    description_equipe = $2,
    statut_recrutement = $3,
    lien_github = $4,
    idProjet = $5,
    idCapitaine = $6
    WHERE idEquipe = $7`;

    try {
        pool.query(modifier, valeurs);
    } catch (error) {
        throw error;
    }
}

function ajouterMembre(valeurs, idEquipe) {

    for (i = 0; i < valeurs.length; i++) {

        let info = [valeurs[i], idEquipe];
        let inserer = `INSERT INTO Appartenir (idUser, idEquipe)
        VALUES ($1, $2)`;

        try {
            pool.query(inserer, info);
        } catch (error) {
            throw error
        }
    }

}

async function suprimerTousMembres(idEquipe){

    const supprimer = `DELETE FROM Appartenir
    WHERE idEquipe = $1`;

    try {
        pool.query(supprimer, [idEquipe]);
    } catch (error) {
        throw error;
    }

}

function supprimerUnMembre(idEquipe, idMembre){

}

function supprimerEquipe(idEquipe) {

    const supprimer = `DELETE FROM Equipe 
    WHERE idEquipe = $1`;

    try {
        pool.query(supprimer, [idEquipe]);
    } catch (error) {
        throw error;
    }
}

function aUneEquipe(idEtudiant) {

    const appartientAUneEquipe = `SELECT * FROM Appartenir WHERE idUser = $1`;

    return new Promise((resolve, reject) => {
        pool.query(appartientAUneEquipe, [idEtudiant])
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

async function jsonInfosEquipe(idEquipe) {

    try {

        const chercher = await chercherEquipeID(idEquipe);

        jsonRetour = {}

        if (chercher === 0) {
            return 'aucun';
        } else {

            temp = chercher[0];

            jsonRetour.id = temp.idequipe;
            jsonRetour.nom = temp.nom;
            jsonRetour.description = temp.description_equipe;
            jsonRetour.statut = temp.statut_recrutement;
            jsonRetour.idProjet = temp.idprojet;
            jsonRetour.idCapitaine = temp.idcapitaine;

            if (temp.lien_github == null) {
                jsonRetour.github = '';
            } else {
                jsonRetour.github = temp.lien_github;
            }

            if (temp.finaliste == null) {
                jsonRetour.finaliste = '';

            } else {
                jsonRetour.finaliste = temp.finaliste;
            }


            return jsonRetour;
        }

    } catch (error) {
        throw error;
    }
}


/**Permet de voir les équipes associées à un projet */
async function jsonListeEquipeProjet(idProjet) {

    try {
        const equipeList = await listeEquipeProjet(idProjet);

        jsonRetour = {};
        jsonRetour.equipe = []

        for (i = 0; i < equipeList.length; i++) {

            equipeCourante = equipeList[i];

            temp = {};

            //temp.img = equipeList IMAGE

            temp.id = equipeCourante.idequipe;
            temp.idProjet = idProjet;
            temp.nom = equipeCourante.nom;
            if (equipeCourante.description_equipe === null) {
                temp.description = '';
            } else {
                temp.description = equipeCourante.description_equipe;
            }
            temp.statut = equipeCourante.statut_recrutement;

            if (equipeCourante.lien_github === null) {
                temp.lien_github = '';
            } else {
                temp.lien_github = equipeCourante.lien_github;
            }

            temp.idprojet = equipeCourante.idprojet;
            temp.idCapitaine = equipeCourante.idcapitaine;

            if (equipeCourante.finaliste === null) {
                temp.finaliste = '';
            } else {
                temp.finaliste = equipeCourante.finaliste;
            }

            jsonRetour.equipe.push(temp);
        }

        return jsonRetour;

    } catch (error) {

        console.error(error);
    }
}


function jsonListeEquipeEvent() {

}


function trouverEquipe() { }



module.exports = {
    aUneEquipe,
    trouverEquipe,
    jsonListeEquipeProjet,
    supprimerEquipe,
    creerEquipe,
    jsonListeEquipeEvent,
    listeEquipeProjet,
    jsonInfosEquipe,
    chercherEquipeID,
    validerEquipe,
    ajouterMembre,
    modifierEquipe,
    suprimerTousMembres
}