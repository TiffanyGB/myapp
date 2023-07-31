const gererProjet = require('../models/gererProjet');
const equipeModel = require('../models/equipeModel');

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
/*ASG --> Admin, etudiant(capitaine), gestionnaire en charge de l'équipe*/
async function checkACG(req, res, next) {
  const id = res.locals.idEquipe;

  const equipe = await equipeModel.chercherEquipeID(id);

  if (equipe.length === 0) {
    return res.status(404).json({ erreur: 'L\'id de l\'équipe n\'existe pas' });
  }

  if (req.userProfile === 'admin') {
    next();
  } else if (req.userProfile === 'gestionnaire') {
    const gerer_ia = await gererProjet.chercherGestionnaireIA(id, req.id);
    const gerer_ext = await gererProjet.chercherGestionnaireExtID(id, req.id);

    if (gerer_ia.length > 0 || gerer_ext.length > 0) {
      next();
    } else {
      return res.status(400).json({ erreur: `Mauvais profil, il faut gérer l'événement.` });
    }
  } else if (req.userProfile === 'etudiant') {
    if (equipe[0].idcapitaine === req.id) {
      next();
    } else {
      return res.status(400).json({ erreur: `Mauvais profil, il faut être capitaine.` });
    }
  } else {
    return res.status(400).json({ erreur: `Mauvais profil, il faut être admin, capitaine ou gestionnaire du projet.` });
  }
}



/*ASG --> Admin, etudiant(doit être dans l'équipe), gestionnaire  en charge de l'équipe*/
async function checkAEG(req, res, next) {
  const id = res.locals.idEquipe;

  /*Vérifier que l'id de l'équipe existe */
  const equipe = await equipeModel.chercherEquipeID(id);

  if (equipe.length === 0) {
    return res.status(404).json({ erreur: 'L\'id de l\'équipe n\'existe pas' });
  }

  if (req.userProfile === 'admin') {
    next();
  } else if (req.userProfile === 'gestionnaire') {
    const gerer_ia = await gererProjet.chercherGestionnaireIA(equipe.idprojet, req.id);
    const gerer_ext = await gererProjet.chercherGestionnaireExtID(equipe.idprojet, req.id);

    if (gerer_ia.length > 0 || gerer_ext.length > 0) {
      next();
    } else {
      return res.status(400).json({ erreur: `Mauvais profil, il faut gérer le projet.` });
    }
  } else if (req.userProfile === 'etudiant') {
    const appartient = await equipeModel.appartenirEquipe(req.id, id);
    if (appartient.length > 0) {
      next();
    } else {
      return res.status(400).json({ erreur: `Il faut faire partie de l'équipe ` + id + ` pour envoyer des messages.` });
    }
  } else {
    return res.status(400).json({ erreur: `Mauvais profil, il faut être admin, gestionnaire du projet ou faire partie de l'équipe.` });
  }
}

async function checkAEG2222(req, res, next) {
  const id = res.locals.projetId;

  if (req.userProfile === 'admin') {
    next();
  } else if (req.userProfile === 'gestionnaire') {
    const gerer_ia = await gererProjet.chercherGestionnaireIA(id, req.id);
    const gerer_ext = await gererProjet.chercherGestionnaireExtID(id, req.id);

    console.log(gerer_ia, gerer_ext)
    if (gerer_ia.length > 0 || gerer_ext.length > 0) {
      next();
    } else {
      return res.status(400).json({ erreur: `Mauvais profil, il faut gérer le projet.` });
    }
  } else {
    return res.status(400).json({ erreur: `Mauvais profil, il faut être admin, gestionnaire du projet ou faire partie de l'équipe.` });
  }
}


/*Que l'admin et le gestionnaire du projet */
async function checkAG(req, res, next) {
  const id = res.locals.idProjet;

  /*Vérifier que l'id de l'équipe existe */
  const equipe = await equipeModel.chercherEquipeID(id);

  if (equipe.length === 0) {
    return res.status(404).json({ erreur: 'L\'id de l\'équipe n\'existe pas' });
  }

  if (req.userProfile === 'admin') {
    next();
  } else if (req.userProfile === 'gestionnaire') {
    const gerer_ia = await gererProjet.chercherGestionnaireIA(id, req.id);
    const gerer_ext = await gererProjet.chercherGestionnaireExtID(id, req.id);

    if (gerer_ia.length > 0 || gerer_ext.length > 0) {
      next();
    } else {
      return res.status(400).json({ erreur: `Mauvais profil, il faut gérer le projet.` });
    }
  } else {
    return res.status(400).json({ erreur: `Mauvais profil, il faut être admin, gestionnaire du projet ou faire partie de l'équipe.` });
  }
}

async function checkATousGestionnaires(req, res, next) {

  if (req.userProfile === 'admin' || req.userProfile === 'gestionnaire') {
    next();
  } else {
    return res.status(400).json({ erreur: `Mauvais profil, il faut être admin ou gestionnaire` });
  }
}

/*Doit etre connecté */
async function interdireAucunProfil(req, res, next) {
  if (req.userProfile === 'aucun') {
    return res.status(400).json({ erreur: `Il faut avoir un compte.` });
  } else {
    next();
  }
}


module.exports = { checkProfile, checkACG, interdireAucunProfil, checkAEG, checkAG, checkATousGestionnaires, checkAEG2222 };