function checkAdminProfile(req, res, next) {
  if (req.userProfile === 'admin') {
    // Si l'utilisateur est administrateur, passez à la prochaine fonction de middleware
    next();
  } else {
    res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur" });
  }
}

function checkStudentProfile(req, res, next) {
  if (req.userProfile === 'etudiant') {
    next();
  } else {
    res.status(400).json({ erreur: "Mauvais profil, il faut être etudiant" });
  }
}
module.exports = { checkAdminProfile, checkStudentProfile };