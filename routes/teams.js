var express = require('express');
var router = express.Router();
const indexController = require('../controllers/indexController');
const equipeController = require('../controllers/equipeController');
const equipeModel = require('../models/equipeModel');
const messageController = require('../controllers/messageController');
const profil = require('../middleware/verifProfil');

const etudiantProfil = profil.checkProfile('etudiant');
const capitaineAdminGes = profil.checkACG;
const capitaine = profil.checkCapitaine;
const aucunProfil = profil.interdireAucunProfil;

const { verifIdNombre } = require('../verifications/verifierDonnéesGénérales');

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

    try {
        if (verifIdNombre(res.locals.idEquipe, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'équipe');
    }
    next();
}, indexController.verifyToken,
    capitaineAdminGes,
    equipeModel.validerEquipe,
    equipeController.modifierEquipe);

/* Supprimer une équipe */
router.all('/delete/:id', (req, res, next) => {
    res.locals.idEquipe = req.params.id;

    try {
        if (verifIdNombre(res.locals.idEquipe, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'équipe');
    }
    next();
}, indexController.verifyToken,
    capitaineAdminGes,
    equipeController.supprimerEquipe);

router.all('/:id/ouvertes', (req, res, next) => {
    res.locals.idEvent = req.params.id;

    try {
        if (verifIdNombre(res.locals.idEvent, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'équipe');
    }
    next();
}, indexController.verifyToken,
    etudiantProfil,
    equipeController.listeOuvertes);

/* Promouvoir un membre --> capitaine*/
router.all('/:id/promouvoir', (req, res, next) => {
    res.locals.idEquipe = req.params.id;

    try {
        if (verifIdNombre(res.locals.idEquipe, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'équipe');
    }
    next();
}, indexController.verifyToken,
    capitaineAdminGes,
    equipeController.promouvoir);

/* Supprimer un membre */
router.all('/:id/supprimerMembre', (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    try {
        if (verifIdNombre(res.locals.idEquipe, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'équipe');
    }
    next();
}, indexController.verifyToken,
    capitaineAdminGes,
    equipeController.supprimerMembre);

router.all('/:id/quitterEquipe', (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    try {
        if (verifIdNombre(res.locals.idEquipe, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'équipe');
    }
    next();
}, indexController.verifyToken,
    etudiantProfil,
    equipeController.quitterEquipe);

router.all('/:id/infos', (req, res, next) => {
    res.locals.idEquipe = req.params.id;

    try {
        if (verifIdNombre(res.locals.idEquipe, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'équipe');
    }
    next();
}, indexController.verifyToken,
    aucunProfil,
    equipeController.getInfosEquipe);


router.all('/:id/demandeAdmission', (req, res, next) => {
    res.locals.idEquipe = req.params.id;

    try {
        if (verifIdNombre(res.locals.idEquipe, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'équipe');
    }
    next();
}, indexController.verifyToken,
    etudiantProfil,
    equipeController.demandeEquipe);


router.all('/:id/AccepterDemande', (req, res, next) => {
    res.locals.idEquipe = req.params.id;

    try {
        if (verifIdNombre(res.locals.idEquipe, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'équipe');
    }

    next();
}, indexController.verifyToken,
    capitaineAdminGes,
    equipeController.accepterDemande);

router.all('/:id/declinerDemande', (req, res, next) => {
    res.locals.idEquipe = req.params.id;

    try {
        if (verifIdNombre(res.locals.idEquipe, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'équipe');
    }
    next();
}, indexController.verifyToken,
    capitaineAdminGes,
    equipeController.declinerDemande);

router.all('/mesEquipes',
    indexController.verifyToken,
    etudiantProfil,
    equipeController.voirMesEquipes);

router.all('/:id/message', async (req, res, next) => {
    res.locals.idEquipe = req.params.id;
    
    try {
        if (verifIdNombre(res.locals.idEquipe, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro de l\'event');
    }
    next();
}, indexController.verifyToken, messageController.recupererMessageEquipe);

/************************J'enleve cette methode pour voir si ça casse coté front, si non, alors supprimer */
/**Voir une équipe */
// router.all('/:id', (req, res, next) => {
//     res.locals.idEquipe = req.params.id;
//     next();
// }, indexController.verifyToken,
//     adminProfil,
//     equipeController.informationsEquipeAdmin);

module.exports = router;