const pool = require('../database/configDB');
const { body } = require('express-validator');

async function validerRegles(req) {
    body('titre')
        .notEmpty().withMessage('Le titre ne doit pas être vide.')
        .isLength({ min: 2, max: 50 }).withMessage('Le prénom doit avoir une longueur comprise entre 2 et 50 caractères.')
        .run(req);

    body('contenu')
        .notEmpty().withMessage('La règle ne doit pas être vide.')
        .isLength({ min: 2, max: 1000 }).withMessage('Le lien doit avoir une longueur comprise entre 3 et 1000 caractères.')
        .run(req);
}

/**Récupérer une regle à partir de l'id de l'event */
function recuperer_regles(idEvent) {

    const chercherProjets = `SELECT * FROM Regle WHERE idevent = $1`

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

/**Ajouter une regle à un event */
function ajouterRegle(idEvent, titre, contenu) {

    const valeur = [titre, contenu, idEvent];

    const ajouter = `INSERT INTO Regle (titre, contenu, idevent)
    VALUES ($1, $2, $3)`;

    return new Promise((resolve, reject) => {
        pool.query(ajouter, valeur)
            .then(() => {
                resolve('true');
            })
            .catch((error) => {
                reject(error);
            });
    });
}

async function supprimerRegles(idEvent) {

    const supprimer = `DELETE FROM Regle 
    WHERE idEvent = $1`;

    try {
        pool.query(supprimer, [idEvent]);
    } catch (error) {
        throw error;
    }
}


module.exports = {
    recuperer_regles,
    ajouterRegle,
    supprimerRegles,
    validerRegles,
}