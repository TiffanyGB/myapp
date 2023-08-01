var express = require('express');
var router = express.Router();
const equipeController = require('../controllers/equipeController');
const equipeModel = require('../models/equipeModel');
const profil = require('../middleware/verifProfil');
const tokenModel = require('../models/tokenModel');
const annotationController = require('../controllers/annotationController');

const etudiantProfil = profil.checkProfile('etudiant');
const capitaineAdminGes = profil.checkACG;
const aucunProfil = profil.interdireAucunProfil;

const { verifIdNombre } = require('../verifications/verifierDonnéesGénérales');

/**Créer une équipe */
router.all('/creationEquipe',
    tokenModel.verifyToken,
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
}, tokenModel.verifyToken,
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
}, tokenModel.verifyToken,
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
}, tokenModel.verifyToken,
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
}, tokenModel.verifyToken,
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
}, tokenModel.verifyToken,
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
}, tokenModel.verifyToken,
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
}, tokenModel.verifyToken,
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
}, tokenModel.verifyToken,
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
}, tokenModel.verifyToken,
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
}, tokenModel.verifyToken,
    capitaineAdminGes,
    equipeController.declinerDemande);

router.all('/mesEquipes',
    tokenModel.verifyToken,
    etudiantProfil,
    equipeController.voirMesEquipes);

router.all('/:id/annoter',
    (req, res, next) => {
        res.locals.idEquipe = req.params.id;

        try {
            if (verifIdNombre(res.locals.idEquipe, res) === -1) {
                return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
            }
        } catch {
            return res.status(400).json('Problème lors de la vérification du numéro de l\'équipe');
        }
        next();
    }, tokenModel.verifyToken,
    //GestionnaireEquipeAdmin,
    annotationController.ecrireAnnotation);

router.all('/:id/getAnnotation',
    (req, res, next) => {
        res.locals.idEquipe = req.params.id;

        try {
            if (verifIdNombre(res.locals.idEquipe, res) === -1) {
                return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
            }
        } catch {
            return res.status(400).json('Problème lors de la vérification du numéro de l\'équipe');
        }
        next();
    }, tokenModel.verifyToken,
    //GestionnaireEquipeAdmin,
    annotationController.getAnnotationEquipe);

module.exports = router;