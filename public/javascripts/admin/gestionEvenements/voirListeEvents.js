const pool = require('../../../../database/configDB');
const fi = require('../../index/fonctions_inscription');
const rechercheProjet = require('../../rechercheEvents');
const recup = require('../../index/recuperer_event_choisi');


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
                temp.themes = [];

                const listeMots = await recup.recupererMot(projetCourant.idprojet);

                for (j = 0; j < listeMots.length; j++) {

                    let motCourant = listeMots[j];
                    temp.themes.push(motCourant.mot);
                }

                temp.ressources = [];

                let listeRessource = await recup.recuperer_toutes_ressources(projetCourant.idprojet);
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

listeProjetsJson();

module.exports = {
    listeProjetsJson
}