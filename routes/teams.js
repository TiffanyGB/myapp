var express = require('express');
var router = express.Router();
const indexController = require('../controllers/indexController');
const equipeController = require('../controllers/equipeController');
const equipeModel = require('../models/equipeModel');
const profil = require('../middleware/verifProfil');

const etudiantProfil = profil.checkProfile('etudiant');
const adminProfil = profil.checkProfile('admin');
const profilMultiple = profil.checkAEG();
const capitaine = profil.checkCapitaine;
const aucunProfil = profil.interdireAucunProfil;

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
    capitaine,
    equipeModel.validerEquipe,
    equipeController.modifierEquipe);

/* Supprimer une équipe */
router.all('/delete/:id', (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    next();
}, indexController.verifyToken,
    capitaine,
    equipeController.supprimerEquipe);

router.all('/:id/ouvertes', (req, res, next) => {
    res.locals.idEvent = req.params.id;
    next();
}, indexController.verifyToken,
    // etudiantProfil,
    equipeController.listeOuvertes);

/* Promouvoir un membre --> capitaine*/
router.all('/:id/promouvoir', (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    next();
}, indexController.verifyToken,
    capitaine,
    equipeController.promouvoir);

/* Supprimer un membre */
router.all('/:id/supprimerMembre', (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    next();
}, indexController.verifyToken,
    capitaine,
    equipeController.supprimerMembre);

router.all('/:id/quitterEquipe', (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    next();
}, indexController.verifyToken,
    etudiantProfil,
    equipeController.quitterEquipe);

router.all('/:id/infos', (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    next();
}, indexController.verifyToken,
    aucunProfil,
    equipeController.getInfosEquipe);


router.all('/:id/demandeAdmission', (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    next();
}, indexController.verifyToken,
    etudiantProfil,
    equipeController.demandeEquipe);


router.all('/:id/AccepterDemande', (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    next();
}, indexController.verifyToken,
    capitaine,
    equipeController.accepterDemande);

router.all('/:id/declinerDemande', (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    next();
}, indexController.verifyToken,
    capitaine,
    equipeController.declinerDemande);

router.all('/mesEquipes',
    indexController.verifyToken,
    etudiantProfil,
    equipeController.voirMesEquipes);

router.all('/:id/declinerDemande', (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    next();
}, indexController.verifyToken,
    capitaine,
    equipeController.declinerDemande);












/************************J'enleve cette methode pour voir si ça casse coté front, si non, alors supprimer */
/**Voir une équipe */
// router.all('/:id', (req, res, next) => {
//     res.locals.idEquipe = req.params.id;
//     next();
// }, indexController.verifyToken,
//     adminProfil,
//     equipeController.informationsEquipeAdmin);

module.exports = router;