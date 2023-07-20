var express = require('express');
var router = express.Router();
const indexController = require('../controllers/indexController');
const equipeController = require('../controllers/equipeController');
const equipeModel = require('../models/equipeModel');
const profil = require('../middleware/verifProfil');

const etudiantProfil = profil.checkProfile('etudiant');
const profilMultiple = profil.checkAEG();


/**Créer une équipe */
router.all('/creationEquipe',
    indexController.verifyToken,
    etudiantProfil,
    equipeModel.validerEquipe,
    equipeController.creerEquipe
);

/* Modifier une équipe */
router.all('/edit/:id', (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    next();
}, indexController.verifyToken,
    profilMultiple,
    equipeController.modifierEquipe);

/* Supprimer une équipe */
router.all('/delete/:id', (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    next();
}, indexController.verifyToken,
    // profil.checkStudentProfile,
    equipeController.supprimerEquipe);

/* Récupérer les infos modifiables d'une équipe*/
router.all('/:id/infos', (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    next();
}, indexController.verifyToken,
    // profil.checkStudentProfile,
    equipeController.getInfosEquipe);


/**Voir une équipe */
router.all('/:id', (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    next();
}, indexController.verifyToken, equipeController.informationsEquipe);

module.exports = router;