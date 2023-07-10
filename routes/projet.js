var express = require('express');
var router = express.Router();

const indexController = require('../controllers/indexController');
const projetController = require('../controllers/projetController');

/**Voir la liste des projets*/
router.all('/', indexController.verifyToken, projetController.voirListeProjets);

/**créer un projet */
router.all('/creerProjet', indexController.verifyToken, projetController.creerProjet);

/**Modifier projet */


/**Supprimer un projet */

module.exports = router;
