const pool = require('../../../database/configDB');

function nbEvent() {
    const nb = `SELECT COUNT(*) AS total FROM Evenement`;

    return new Promise((resolve, reject) => {
        pool.query(nb)
            .then((result) => {
                resolve(result.rows[0].total);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function recuperer_regles(idEvent) {

    const chercherProjets = `SELECT * FROM Regle WHERE idevent = ${idEvent}`

    return new Promise((resolve, reject) => {
        pool.query(chercherProjets)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function recuperer_projets(idEvent) {

    const chercherProjets = `SELECT * FROM Projet WHERE idevent = ${idEvent}`

    return new Promise((resolve, reject) => {
        pool.query(chercherProjets)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function recupererMot(idProjet) {

    const chercherMots = `SELECT * FROM mot_cle WHERE idProjet = ${idProjet}`

    return new Promise((resolve, reject) => {
        pool.query(chercherMots)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function recuperer_ressourcesPubliques(idProjet) {

    const chercherRessources = `SELECT * FROM Ressource WHERE idprojet = ${idProjet} AND statut = 'public'`;

    return new Promise((resolve, reject) => {
        pool.query(chercherRessources)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function recuperer_message_fin(idEvent) {

    const message = `SELECT * FROM Evenement WHERE idEvent = '${idEvent}'`;

    return new Promise((resolve, reject) => {
        pool.query(message)
            .then((res) => {
                resolve(res);
            })
            .catch((error) => {
                reject(error);
            });
    })
}

function recuperer_ressourcesPrivées(idProjet) {

    const chercherRessources = `SELECT * FROM Ressource WHERE idprojet = ${idProjet} and statut= 'privé'`;

    return new Promise((resolve, reject) => {
        pool.query(chercherRessources)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
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

function chercherClassement(idEvent) {
    const classement = `SELECT classement FROM Resultat WHERE idevent = '${idEvent}'`;

    return new Promise((resolve, reject) => {
        pool.query(classement)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function estInteresse(idEvent, idEtudiant) {

}

function trouverEquipe(){}

function chercher_finalistes(idEvent) {
    const finaliste = `SELECT * FROM Equipe WHERE finaliste = '${idEvent}'`;

    return new Promise((resolve, reject) => {
        pool.query(finaliste)
            .then((res) => {
                resolve(res.rows);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

async function recupererEvent(idEvent, typeUser) {
    const chercherEvent = `SELECT * FROM Evenement WHERE idevent = ${idEvent}`;
    let tabRetour = {};

    try {
        const res = await pool.query(chercherEvent);
        if (res.rows.length === 1) {
            const event = res.rows[0];

            /**Insertion des données de l'event */
            tabRetour.title = event.nom;
            tabRetour.themes = [];
            tabRetour.date_creation = event.debut_inscription;
            tabRetour.date_debut = event.date_debut;
            tabRetour.date_fin = event.date_fin;
            tabRetour.type_challenge = event.type_event;
            tabRetour.description = event.description_event;
            tabRetour.nbMinParEquipe = event.nombre_min_equipe;
            tabRetour.nbMaxParEquipe = event.nombre_max_equipe;
            tabRetour.projet = [];
            tabRetour.regles = [];


            /**Récupérer les projets associé à l'event*/
            const listeProjets = await recuperer_projets(idEvent);

            const listeRegles = await recuperer_regles(idEvent);
            for (i = 0; i < listeRegles.length; i++) {

                let regleCourante = listeRegles[i];
                let reglesInfos = {};

                reglesInfos.titre = regleCourante.titre;
                reglesInfos.contenu = regleCourante.contenu;

                tabRetour.regles.push(reglesInfos);
            }

            /**Les projets */
            for (i = 0; i < listeProjets.length; i++) {

                let projetCourant = listeProjets[i];
                let projetInfos = {};

                projetInfos.img = projetCourant.imgprojet;
                projetInfos.titre = projetCourant.nom;
                projetInfos.description = projetCourant.description_projet;
                projetInfos.recompense = projetCourant.recompense;
                projetInfos.sujet = projetCourant.sujet;
                projetInfos.thematique = [];


                const listeMots = await recupererMot(projetCourant.idprojet);

                for (j = 0; j < listeMots.length; j++) {

                    let motCourant = listeMots[j];

                    tabRetour.themes.push(motCourant.mot);

                    projetInfos.thematique.push(motCourant.mot);
                }

                /**Les ressources */
                const listeRessource = await recuperer_ressourcesPubliques(projetCourant.idprojet);

                projetInfos.ressources = [];

                for (j = 0; j < listeRessource.length; j++) {

                    let ressourceCourante = listeRessource[j];
                    let ressourcesInfos = {};

                    ressourcesInfos.titre = ressourceCourante.titre;
                    ressourcesInfos.type = ressourceCourante.type_ressource;
                    ressourcesInfos.lien = ressourceCourante.lien;
                    ressourcesInfos.description = ressourceCourante.description_ressource;
                    ressourcesInfos.statut = ressourceCourante.statut;

                    projetInfos.ressources.push(ressourcesInfos);

                }

                if (typeUser != 'aucun') {
                    const listeRessourcePv = await recuperer_ressourcesPrivées(projetCourant.idprojet);

                    for (j = 0; j < listeRessourcePv.length; j++) {

                        let ressourceCourante = listeRessourcePv[j];
                        let ressourcesPvInfos = {};    
                        ressourcesPvInfos.titre = ressourceCourante.titre;
                        ressourcesPvInfos.type = ressourceCourante.type_ressource;
                        ressourcesPvInfos.lien = ressourceCourante.lien;
                        ressourcesPvInfos.statut = ressourceCourante.statut;
                        ressourcesPvInfos.description = ressourceCourante.description_ressource;
                        ressourcesPvInfos.statut = ressourceCourante.statut;

                        projetInfos.ressources.push(ressourcesPvInfos);

                    }
                }



                // Ajoute le tableau projetTab au tableau principal tabRetour.projet
                tabRetour.projet.push(projetInfos);

            }

            let classementFinal = await chercherClassement(idEvent);

            console.log(classementFinal);
            if (classementFinal = []) {
                tabRetour.classement = null;
            } else {
                tabRetour.podium = [];

                temp = {}

                temp.premier = classementFinal.premier;
                temp.deuxieme = classementFinal.deuxieme;
                temp.troisieme = classementFinal.troisieme;

                tabRetour.podium.push(temp);
            }

            let finalistes = await chercher_finalistes(idEvent);

            if (finalistes = []) {
                tabRetour.finalistes = null;
            } else {

                tabRetour.finalistes = [];

                for (i = 0; i < finalistes.length; i++) {
                    tabRetour.finalistes.push(finalistes[i]);
                }
            }

            let message = await recuperer_message_fin(idEvent);

            if (message = null) {
                tabRetour.messageFin = null;
            } else {
                tabRetour.messageFin = message;
            }

            if (typeUser === 'etudiant') {

                const equipe = await aUneEquipe(4);
                tabRetour.userIsInterested = false;

                if (equipe > 0) {
                    tabRetour.team = 5;
                } else {
                    tabRetour.team = -1;
                }
            }else{
                tabRetour.userIsInterested = false;
                tabRetour.team = -1;
            }
            return tabRetour;
        } else {
            throw new Error('Evenement non trouvé: erreur dans le fichier "' + __filename + '" dans "' + arguments.callee.name + '"');
        }
    } catch (error) {
        throw error;
    }
}

module.exports = {
    nbEvent,
    recupererEvent,
    recuperer_projets,
    recupererMot
}