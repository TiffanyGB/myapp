var express = require('express');
var router = express.Router();
const pool = require('../database/configDB');
const cors = require('cors');
const adminRouter = require('./admin');
router.use('/admin', adminRouter);
const bodyParser = require('body-parser');
const indexController = require('../controllers/indexController');
const tokenCOntroller = require('../controllers/tokenController');

router.use(bodyParser.json());
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(cors());


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Accueil' });
});

router.all('/inscription', indexController.inscriptionEleve);

router.all('/connexion', indexController.connexion);

router.all('/voir_event', indexController.verifyToken ,indexController.voirEvent);

router.all('/voir_tous_events', indexController.voirTousEvents);


module.exports = router;