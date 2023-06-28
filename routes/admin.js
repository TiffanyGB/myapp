var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController');


/**Page de création d'un nouvel utilisateur */
router.all('/creerUser', adminController.createUser);

router.all('/creerEvent', adminController.createEvent);


module.exports = router;