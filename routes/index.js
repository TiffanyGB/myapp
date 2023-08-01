var express = require('express');
var router = express.Router();
const { verifIdNombre } = require('../verifications/verifierDonnéesGénérales');
const userModel = require('../models/userModel');
const validationDonnees = require('../middleware/validationDonnees');
const tokenModel = require('../models/tokenModel');

const bodyParser = require('body-parser');
const indexController = require('../controllers/indexController');

router.use(bodyParser.json());
router.use(express.json());
router.use(express.urlencoded({ extended: false }));


router.all('/inscription',
  userModel.validateUser,
  validationDonnees.validatePasswordCreation,
  indexController.inscriptionEleve);

router.all('/connexion',
  validationDonnees.connexion,
  indexController.connexion);

router.all('/voir_tous_events', indexController.voirTousEvents);

router.all('/voir_event/:id', async (req, res, next) => {
  res.locals.eventID = req.params.id;

  try {
    if (verifIdNombre(res.locals.eventID, res) === -1) {
      return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
    }
  } catch {
    return res.status(400).json('Problème lors de la vérification du numéro de l\'event');
  }
  next();
}, tokenModel.verifyToken, indexController.voirEvent);

module.exports = router;