const { func } = require('joi');
const pool = require('../database/configDB');



function creerEquipe(){

}
function supprimerEquipe(){}

/**Permet de voir les équipes associées à un projet */
function jsonListeEquipe(){

}

function aUneEquipe(idEtudiant) {

    const appartientAUneEquipe = `SELECT * FROM Appartenir WHERE idUser = '${idEtudiant}'`;

    return new Promise((resolve, reject) => {
        pool.query(appartientAUneEquipe)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}





function trouverEquipe() { }



module.exports = {
    aUneEquipe,
    trouverEquipe,
    jsonListeEquipe
}