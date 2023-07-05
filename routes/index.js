var express = require('express');
var router = express.Router();
// const cors = require('cors');
const adminRouter = require('./admin');
router.use('/users', adminRouter);
const bodyParser = require('body-parser');
const indexController = require('../controllers/indexController');

router.use(bodyParser.json());
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
// router.use(cors());


router.all('/inscription', indexController.inscriptionEleve);

router.all('/connexion', indexController.connexion);

router.all('/voir_tous_events', indexController.voirTousEvents);

router.all('/voir_event/:id', (req, res, next) => {
    res.locals.eventID = req.params.id;
    next();
  }, indexController.verifyToken, indexController.voirEvent);

module.exports = router;