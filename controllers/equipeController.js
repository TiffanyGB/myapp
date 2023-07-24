const equipeModel = require('../models/equipeModel');
const projetModel = require('../models/projetModel');
const etudiantModel = require('../models/etudiantModel');

async function retournerEquipeProjet(req, res) {
  if (req.userProfile === 'admin') {
    if (req.method === 'OPTIONS') {
      res.status(200).json({ sucess: 'Agress granted' });
    }
    else if (req.method === 'GET') {
      const idProjet = res.locals.projetId;

      /**Vérifier que l'id existe dans la bdd, sinon 404 error */
      projetModel.chercherProjetId(idProjet)
        .then((result) => {
          if (result.length === 0) {
            return res.status(404).json({ erreur: "L'id n'existe pas" });
          }
        });

      try {
        const equipeList = await equipeModel.jsonListeEquipeProjet(idProjet);
        res.status(200).json(equipeList);
      } catch (error) {
        res.status(400).json({ erreur: "Erreur lors de la récupération des équipes" });
      }
    }
  } else if (req.userProfile === 'etudiant') {

    res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "etudiant" });
  } else if (req.userProfile === 'gestionnaire') {

    res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "gestionnaire" });
  } else if (req.userProfile === 'aucun') {

    res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "Aucun" });
  }
}

async function creerEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'POST') {

    //Si admin ou gestionnaire, ne pas recuperer l'id capitaine dans le token
    const idCapitaine = req.id;

    const {
      nom,
      statut,
      description,
      idProjet,
    } = req.body;

    const infos = [
      idCapitaine,
      nom,
      description,
      statut,
      idProjet
    ]

    try {
      const aUnequipe = equipeModel.aUneEquipe(idCapitaine);
      if (aUnequipe.length != 0) {
        return res.status(400).json({ erreur: 'A déjà une équipe.' });
      }
    } catch {
      return res.status(400).json({ erreur: 'Erreur vérification de l\'appartenance à une équipe.' });
    }

    try {
      let idEquipe = await equipeModel.creerEquipe(infos);

      equipeModel.ajouterMembre([idCapitaine], idEquipe);

      return res.status(200).json({ message: 'Équipe ' + idEquipe + ' créée avec succès. Capitaine: ' + idCapitaine });
    } catch (error) {
      return res.status(400).json({ erreur: 'Erreur création équipe.' });
    }
  }
}

async function modifierEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'PATCH') {

    const idEquipe = res.locals.idEquipe;

    const {
      nom,
      statut,
      description,
      idProjet,
      github,
      lien_discussion,
      preferenceQuestionnaire
    } = req.body;


    const valeurs = [
      nom,
      description,
      statut,
      github,
      idProjet,
      idEquipe,
      lien_discussion,
      preferenceQuestionnaire
    ]

    try {
      // Vérifier que l'id existe dans la bdd
      const user = await equipeModel.chercherEquipeID(idEquipe);
      if (user.length === 0) {
        return res.status(404).json({ erreur: 'L\'id n\'existe pas' });
      }
      equipeModel.modifierEquipe(valeurs);
      res.status(200).json({ message: "Equipe modifiée" });

    } catch {
      res.status(400).json({ error: "Modification de l'équipe" });
    }
  }
}

async function supprimerEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'DELETE') {

    try {

      const idEquipe = res.locals.idEquipe;

      // Vérifier que l'id existe dans la bdd
      const user = await equipeModel.chercherEquipeID(idEquipe);
      if (user.length === 0) {
        return res.status(404).json({ erreur: 'L\'id n\'existe pas' });
      }
      equipeModel.supprimerEquipe(idEquipe);
      res.status(200).json({ message: "Equipe supprimée" });

    } catch {
      res.status(400).json({ error: "Suppression de l'équipe" });
    }
  }
}

async function promouvoir(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'POST') {

    try {

      const idEquipe = res.locals.idEquipe;

      const {
        idUser
      } = req.body;

      // Vérifier que l'id existe dans la bdd
      const user = await equipeModel.chercherEquipeID(idEquipe);
      if (user.length === 0) {
        return res.status(404).json({ erreur: 'L\'id n\'existe pas' });
      }

      /* Vérifier que l'id appartient à un étudiant */
      const verif = await etudiantModel.chercherStudent(idUser);
      if (verif.length === 0) {
        return res.status(400).json({ error: "Le nouveau capitaine n'est pas un étudiant." });
      }

      equipeModel.promouvoir(idEquipe, idUser);
      res.status(200).json({ message: "Capitaine promu" });

    } catch {
      res.status(400).json({ error: "Erreur promotion" });
    }
  }
}

async function supprimerMembre(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'POST') {

    const idEquipe = res.locals.idEquipe;

    const {
      idUser
    } = req.body;

    try {

      // Vérifier que l'id existe dans la bdd
      const user = await equipeModel.chercherEquipeID(idEquipe);
      if (user.length === 0) {
        return res.status(404).json({ erreur: 'L\'id n\'existe pas' });
      }

      /* Vérifier que l'id appartient à un étudiant */
      let verif = await etudiantModel.chercherStudent(idUser);
      if (verif.length === 0) {
        return res.status(400).json({ error: "Le membre n'est pas un étudiant." });
      }
      //Vérifier que l'etudiant appartienne à l'équipe

      equipeModel.supprimerUnMembre(idUser, idEquipe);
      res.status(200).json({ message: "Membre supprimé" });

    } catch {
      res.status(400).json({ error: "Erreur suppression" });
    }
  }
}
/* Voir le profil, d'une équipe et pour la modif
Si c'est un etudiant lambda ou gestionnaire, voir le minimum
si un membre de l'équipe voir un peu plus
si capitaine/gestionnaire de l'équipe ou admin voir tout */
async function getInfosEquipe(req, res) {

  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'GET') {


    const idEquipe = res.locals.idEquipe;

    const equipe = await equipeModel.chercherEquipeID(idEquipe);
    if (equipe.length === 0) {
      return res.status(404).json({ erreur: 'L\'id n\'existe pas' });
    }

    const jsonRetour = await equipeModel.jsonInformationsEquipe(idEquipe, req);

    res.status(200).json(jsonRetour);
  }
}

/* Admin, inutile je crois, peut etre à supprimer plus tard */
async function informationsEquipeAdmin(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  } else if (req.method === 'GET') {
    const idEquipe = res.locals.idEquipe;

    try {

      const equipeInfos = await equipeModel.chercherEquipeID(idEquipe);
      console.log(equipeInfos);

      if (equipeInfos === 'aucun') {
        return res.status(404).json({ erreur: "L'id de l'équipe n'existe pas" });
      } else {

        const equipeList = await equipeModel.jsonInfosEquipe(idEquipe);
        res.status(200).json(equipeList);
      }
    } catch (error) {

      res.status(500).json({ erreur: "Erreur lors de la récupération de l'équipe" });
    }
  }
}

async function listeOuvertes(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'GET') {

    try {
      const equipesOuvertes = await equipeModel.jsonEquipesOuvertes();
      res.status(200).json(equipesOuvertes);

    } catch {
      res.status(400).json({ error: 'Erreur lors de la récupération' });
    }
  }
}

async function quitterEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'POST') {

    const idUser = req.id;
    const idEquipe = res.locals.idEquipe;

    const equipe = await equipeModel.chercherEquipeID(idEquipe);
    if (equipe.length === 0) {
      return res.status(404).json({ erreur: 'L\'id n\'existe pas' });
    }

    const appartenir = await equipeModel.appartenirEquipe(idUser, idEquipe);
    if (appartenir.length === 0) {
      return res.status(404).json({ erreur: 'L\'étudiant n\'appartient pas à l\'équipe' });
    }

    try {
      equipeModel.quitterEquipe(idEquipe, idUser);
      res.status(200).json({ message: "Equipe quittée" });

    } catch {
      res.status(400).json({ error: 'N\'a pas pu quitter.' });
    }
  }
}

async function demandeEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'POST') {

    const idUser = req.id;
    const idEquipe = res.locals.idEquipe;

    const {
      message
    } = req.body;

    const valeurs = [
      idUser,
      idEquipe,
      message
    ]

    /*Vérif existence équipe */
    const equipe = await equipeModel.chercherEquipeID(idEquipe);
    if (equipe.length === 0) {
      return res.status(404).json({ erreur: 'L\'id n\'existe pas' });
    }

    /* L'étudiant ne doit pas avoir d'équipe */
    const appartenir = await equipeModel.aUneEquipe(idUser);
    if (appartenir.length > 0) {
      return res.status(404).json({ erreur: 'L\'étudiant a déjà une équipe' });
    }

    /* Vérifier si une demande a déjà été envoyée */
    const envoyee = await equipeModel.demandeDejaEnvoyee(idUser, idEquipe);
    console.log(envoyee)
    if (envoyee.length > 0) {
      return res.status(404).json({ erreur: 'Une demande a déjà été envoyée' });
    }

    try {
      equipeModel.envoyerDemande(valeurs);
      res.status(200).json({ message: "Message envoyé" });

    } catch {
      res.status(400).json({ error: 'Erreur lors de l\'envoi du message.' });
    }
  }
}

module.exports = {
  retournerEquipeProjet,
  informationsEquipeAdmin,
  creerEquipe,
  supprimerEquipe,
  modifierEquipe,
  getInfosEquipe,
  listeOuvertes,
  promouvoir,
  supprimerMembre,
  quitterEquipe,
  demandeEquipe
}