var express = require('express');
var router = express.Router();
const indexController = require('../controllers/indexController');
const equipeController = require('../controllers/equipeController');

/**Voir une équipe */
router.all('/:id', (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    next();
}, indexController.verifyToken, equipeController.informationsEquipe);

module.exports = router;