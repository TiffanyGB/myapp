var express = require('express');
var router = express.Router();

const indexController = require('../controllers/indexController');
const projetController = require('../controllers/projetController');
const equipeController = require('../controllers/equipeController');
const profile = require('../middleware/verifProfil');
const checkAdminProfile = profile.checkProfile('admin');
const gestionnaireAdmin = profile.checkATousGestionnaires;
const gestionnaireProjetAdmin = profile.checkAEG2222;
const { verifIdNombre } = require('../verifications/verifierDonnéesGénérales');


/**Voir la liste des projets*/
router.all('/',
    indexController.verifyToken,
    gestionnaireAdmin,
    projetController.voirListeProjets);

router.all('/creerProjets',
    indexController.verifyToken,
    checkAdminProfile,
    projetController.creationProjet);


/**voir informations d'un projet */
router.all('/:id', (req, res, next) => {
    res.locals.projetId = req.params.id;

    try {
        if (verifIdNombre(res.locals.projetId, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro du projet');
    }

    next();
}, indexController.verifyToken, gestionnaireProjetAdmin, projetController.infosProjet);


/**Modifier projet */
router.all('/edit/:id', (req, res, next) => {
    res.locals.projetId = req.params.id;

    try {
        if (verifIdNombre(res.locals.projetId, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro du projet');
    }

    next();
}, indexController.verifyToken,
    checkAdminProfile,
    projetController.modifierProjet);

/**Supprimer un projet */
router.all('/delete/:id', (req, res, next) => {
    res.locals.projetId = req.params.id;

    try {
        if (verifIdNombre(res.locals.projetId, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro du projet');
    }

    next();
}, indexController.verifyToken, checkAdminProfile, projetController.supprimerProjet);

/**Voir équipes du projet */
router.all('/:id/teams', (req, res, next) => {
    res.locals.projetId = req.params.id;

    try {
        if (verifIdNombre(res.locals.projetId, res) === -1) {
            return res.status(400).json({ erreur: 'L\'id doit être un nombre.' })
        }
    } catch {
        return res.status(400).json('Problème lors de la vérification du numéro du projet');
    }

    next();
}, indexController.verifyToken, checkAdminProfile, equipeController.retournerEquipeProjet);



module.exports = router;
