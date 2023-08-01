var express = require('express');
var router = express.Router();

const tokenController = require('../controllers/tokenController')

router.all('/verifierToken',
    tokenController.verifierToken
);

module.exports = router;