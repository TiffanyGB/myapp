var express = require('express');
var router = express.Router();
const indexController = require('../controllers/indexController');

/**Voir une équipe */
router.all('/:id', (req, res, next) => {
    res.locals.projetId = req.params.id;
    next();
}, indexController.verifyToken);

module.exports = router;