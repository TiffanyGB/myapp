var express = require('express');
var router = express.Router();
const pool = require('../database/configDB');
const fi = require('../public/javascripts/fonctions_inscription');
const  cu = require('../public/javascripts/creerUser')
const fmdp = require('../public/javascripts/fonctions_mdp');
const adminController = require('../controllers/adminController');


/**Page de création d'un nouvel utilisateur */
router.all('/creerUser', adminController.createUser);

router.all('/creerEvent', function(req, res) {

  if (req.method === 'GET') {
    res.render('admin/creerEvent', { title: 'Créer user' });
  } else if (req.method === 'POST') {

   
  }
});
module.exports = router;