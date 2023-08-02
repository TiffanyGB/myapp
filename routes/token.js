/**
 * @fileoverview Fonctions liées aux token.
 * @module Token
 */

var express = require('express');
var router = express.Router();

const tokenController = require('../controllers/tokenController')

router.all('/verifierToken',
    tokenController.verifierToken
);

router.all('/supprimerToken',
    tokenController.supprimerToken
);

module.exports = router;