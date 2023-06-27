var express = require('express');
var router = express.Router();
const pool = require('../database/configDB');
const cors = require('cors');
const adminRouter = require('./admin');
router.use('/admin', adminRouter);
const bodyParser = require('body-parser');
const indexController = require('../controllers/indexController');

router.use(bodyParser.json());
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.use(cors());

/* Page accueil */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Accueil' });
});

router.all('/inscription', indexController.inscriptionEleve);

/** Connexion */
router.all('/connexion', indexController.connexion);

/*Liste des utilisateurs*/
router.get('/liste',(req, res) => {
  pool.query('SELECT * FROM Utilisateur', (err, result) => {
    if (!err) {
      const users = result.rows;
      res.render('liste', { users });
    } else {
      console.log(err.message);
    }
  });
});

module.exports = router;