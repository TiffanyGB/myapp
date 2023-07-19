const equipeModel = require('../models/equipeModel');
const projetModel = require('../models/projetModel');

async function retournerEquipeProjet(req, res) {
  // if (req.userProfile === 'admin') {
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
  // } else if (req.userProfile === 'etudiant') {

  //   res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "etudiant" });
  // } else if (req.userProfile === 'gestionnaire') {

  //   res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "gestionnaire" });
  // } else if (req.userProfile === 'aucun') {

  //   res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "Aucun" });
  // }
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
      membre
    } = req.body;


    const infos = [
      idCapitaine,
      nom,
      description,
      statut,
      idProjet
    ]


    try {
      await equipeModel.creerEquipe(infos); 
      res.status(200).json({ message: 'Équipe créée avec succès' });
    } catch (error) {
      res.status(400).json({ erreur: 'Erreur création équipe.' });
    }
  }
}

async function supprimerEquipe(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  }
  else if (req.method === 'DELETE') {

    res.status(200).json("ok");
  }
}

async function informationsEquipe(req, res) {
  // if (req.userProfile === 'admin') {
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
  // } else if (req.userProfile === 'etudiant') {
  //   res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "etudiant" });
  // } else if (req.userProfile === 'gestionnaire') {
  //   res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "gestionnaire" });
  // } else if (req.userProfile === 'aucun') {
  //   res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur", profil: "Aucun" });
  // }
}
module.exports = {
  retournerEquipeProjet,
  informationsEquipe,
  creerEquipe,
  supprimerEquipe

}