const pool = require('../database/configDB');

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

function creerEquipe() {

}

function supprimerEquipe() {

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



    } catch(error) {
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
}