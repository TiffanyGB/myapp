const equipeModel = require('../models/equipeModel');
const projetModel = require('../models/projetModel');

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

    const {
      nom,
      idCapitaine,
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
      let idEquipe = await equipeModel.creerEquipe(infos);

      equipeModel.ajouterMembre([idCapitaine], idEquipe);

      res.status(200).json({ message: 'Équipe ' + idEquipe + ' créée avec succès' });
    } catch (error) {
      res.status(400).json({ erreur: 'Erreur création équipe.' });
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
      idCapitaine,
      statut,
      description,
      idProjet,
      membre,
      github
    } = req.body;


    const valeurs = [
      nom,
      description,
      statut,
      github,
      idProjet,
      idCapitaine,
      idEquipe
    ]

    try {
      // Vérifier que l'id existe dans la bdd
      const user = await equipeModel.chercherEquipeID(idEquipe);
      if (user.length === 0) {
        return res.status(404).json({ erreur: 'L\'id n\'existe pas' });
      }
      equipeModel.suprimerTousMembres(idEquipe);
      equipeModel.modifierEquipe(valeurs);
      equipeModel.ajouterMembre(membre, idEquipe);
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


module.exports = {
  retournerEquipeProjet,
  informationsEquipeAdmin,
  creerEquipe,
  supprimerEquipe,
  modifierEquipe,
  getInfosEquipe,
  listeOuvertes
}