const pool = require('../../../database/configDB');

function creerEvent(a){

    const insererEvent= `INSERT INTO Evenement (nom, debut_inscription, date_debut, date_fin, date_resultat, img, regles, nombre_min_equipe, nombre_max_equipe, type_event)
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10`;

    console.log("Nom event:" + a);
    

}

function insererProjets(listeProjets){

}


module.exports = {
    creerEvent,
    insererProjets
};