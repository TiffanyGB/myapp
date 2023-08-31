var express = require('express');
var router = express.Router();
/*Autres require */

/**
 * Toutes les routes des questionnaires
 **/

router.all('/creationQuestionnaire',
    tokenModel.verifyToken,
    etudiantProfil,
    equipeModel.validerEquipe,
    async (req, res, next) => {
        try {
            await equipeController.creerEquipe(req, res, next);
        } catch (error) {
            next(error);
        }
    });


router.all('/creationQuestionnaire',
    questionnaireController.creerQuestionnaire);





module.exports = router;




