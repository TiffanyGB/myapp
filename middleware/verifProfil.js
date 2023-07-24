const gererProjet = require('../models/gererProjet');

/*Un seul profil autorisé */
function checkProfile(type) {
  return function (req, res, next) {
    /* admin, gestionnaire, etudiant */
    if (req.userProfile === type) {
      next();
    } else {
      res.status(400).json({ erreur: `Mauvais profil, il faut être ${type}.` });
    }
  };
}
/*ASG --> Admin, etudiant(capitaine), gestionnaire*/
// Assurez-vous que la fonction externe est asynchrone (marquée avec async)
async function checkAEG() {
  return async function (req, res, next) {
    if (req.userProfile === 'admin') {
      next();
    } else if (req.userProfile === 'gestionnaire') {
      console.log(req.id);
      const id = res.locals.idEquipe;

      const gerer_ia = await gererProjet.chercherGestionnaireIA(req.id);
      const gerer_ext = await gererProjet.chercherGestionnaireExtID(req.id);

      if (gerer_ia.length > 0) {
        next();
      } else if (gerer_ext > 0) {
        next();
      }else{
        return res.status(400).json({ erreur: `Mauvais profil, il faut gérer l'événement.` });
      }

    } else if (req.userProfile === 'etudiant') {
      // Faites ce que vous voulez pour le profil 'etudiant'
      next();
    } else {
      res.status(400).json({ erreur: `Mauvais profil, il faut être admin, étudiant ou gestionnaire du projet.` });
    }
  };
}


/**Vérifier capitaine et respo projet */


//Que le capitaine
function checkCapitaine() {
  return function (req, res, next) {
    if (req.userProfile === 'etudiant') {

    }
    else {
      return res.status(400).json({ erreur: `Mauvais profil, il faut être etudiant.` });
    }
  };
}

module.exports = { checkProfile, checkAEG, checkCapitaine };