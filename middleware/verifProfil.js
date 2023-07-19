function checkAdminProfile(req, res, next) {
    if (req.userProfile === 'admin') {
      // Si l'utilisateur est administrateur, passez à la prochaine fonction de middleware
      next();
    } else {
      // Sinon, renvoyez une réponse JSON indiquant l'erreur
      res.status(400).json({ erreur: "Mauvais profil, il faut être administrateur" });
    }
  }

  module.exports = {checkAdminProfile};