function checkStudentProfile(req, res, next) {
  if (req.userProfile === 'etudiant') {
    next();
  } else {
    res.status(400).json({ erreur: "Mauvais profil, il faut être etudiant" });
  }
}

/*Un seul profil autorisé */
function checkProfile(type) {
  return function(req, res, next) {
    /* admin, gestionnaire, etudiant */
    if (req.userProfile === type) {
      next();
    } else {
      res.status(400).json({ erreur: `Mauvais profil, il faut être ${type}.` });
    }
  };
}
/*ASG --> Admin, etudiant(capitaine), gestionnaire*/
function checkAEG(){
  return function(req, res, next) {
    if ((req.userProfile === 'admin')){
      next();
    }else if(req.userProfile === 'gestionnaire'){
      console.log(req.id);
      next();
    }else if(req.userProfile === 'etudiant'){

    }
     else {
      res.status(400).json({ erreur: `Mauvais profil, il faut être admin, etudiant ou gestionnaire du projet.` });
    }
  };
}


module.exports = {checkStudentProfile, checkProfile, checkAEG };