var express = require('express');
var router = express.Router();

const projetController = require('../controllers/projetController');
const equipeController = require('../controllers/equipeController');
const { validateProjet } = require('../models/projetModel');
const profile = require('../middleware/verifProfil');
const tokenModel = require('../models/tokenModel');

const checkAdminProfile = profile.checkProfile('admin');
const gestionnaireAdmin = profile.checkATousGestionnaires;
const gestionnaireProjetAdmin = profile.checkAGidProjet;
const { verifIdNombre } = require('../verifications/verifierDonnéesGénérales');
const { verifIdProjet } = require('../middleware/verifExistenceIdRoute');


/**Voir la liste des projets*/
router.all('/',
    tokenModel.verifyToken,
    gestionnaireAdmin,
    projetController.voirListeProjets);

router.all('/creerProjets',
    tokenModel.verifyToken,
    checkAdminProfile,
    validateProjet,
    projetController.creationProjet);


/**voir informations d'un projet */
router.all('/:id', (req, res, next) => {
    res.locals.idProjet = req.params.id;

    try {
        if (verifIdNombre(res.locals.idProjet, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro du projet');
    }

    next();
}, tokenModel.verifyToken,
    gestionnaireProjetAdmin,
    verifIdProjet,
    projetController.infosProjet);


/**Modifier projet */
router.all('/edit/:id', (req, res, next) => {
    res.locals.idProjet = req.params.id;

    try {
        if (verifIdNombre(res.locals.idProjet, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro du projet');
    }

    next();
}, tokenModel.verifyToken,
    checkAdminProfile,
    verifIdProjet,
    validateProjet,
    projetController.modifierProjet);

/**Supprimer un projet */
router.all('/delete/:id', (req, res, next) => {
    res.locals.idProjet = req.params.id;

    try {
        if (verifIdNombre(res.locals.idProjet, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro du projet');
    }

    next();
}, tokenModel.verifyToken,
    checkAdminProfile,
    verifIdProjet,
    projetController.supprimerProjet);

/**Voir équipes du projet */
router.all('/:id/teams', (req, res, next) => {
    res.locals.idProjet = req.params.id;

    try {
        if (verifIdNombre(res.locals.idProjet, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro du projet');
    }

    next();
}, tokenModel.verifyToken, gestionnaireProjetAdmin,verifIdProjet, equipeController.retournerEquipeProjet);



module.exports = router;
