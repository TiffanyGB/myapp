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
    /* admin, gestionnaire, etudiant, 'etudiant ou admin', 'etudiant ou admin ou gestionnaire', 'admin ou gestionnaire */
    if (req.userProfile === type) {
      next();
    } else {
      res.status(400).json({ erreur: `Mauvais profil, il faut être ${type}.` });
    }
  };
}



module.exports = {checkStudentProfile, checkProfile };