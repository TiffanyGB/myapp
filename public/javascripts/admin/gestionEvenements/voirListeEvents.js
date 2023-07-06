const pool = require('../../../../database/configDB');
const fi = require('../../index/fonctions_inscription');
const rechercheProjet = require('../../rechercheEvents');


function listeEvents() {

}

async function listeProjetsJson() {

    try {
        let projetsListe = await rechercheProjet.tousLesProjets();

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

                jsonRetour.projets.push(temp);
            }
            

            console.log(jsonRetour);
            return jsonRetour;
        }
    }
    catch {

    }
}

listeProjetsJson();

module.exports = {
    listeProjetsJson
}