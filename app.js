var createError = require('http-errors');
var i18n = require('i18n');
const bodyParser = require('body-parser');
const fs = require('fs');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

/**Routes */
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var gestionnaireRouter = require('./routes/gestionnaire');
var adminRouter = require('./routes/admin');
var eventsRouter = require('./routes/events');
var etudiantRouter = require('./routes/etudiant');

/**crée une instance de l'application Express */
var app = express();

/** configure le moteur de rendu de vues en spécifiant le répertoire views où se trouvent les fichiers de vue et le moteur de rendu pug */
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/**configure le middleware express.static() pour servir les fichiers statiques du répertoire public, tels que les images, les fichiers CSS, etc */
app.use(express.static(path.join(__dirname, 'public')));

const corsOptions = {
  origin: '*',
  methods: 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
  allowedHeaders: 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, method',
  maxAge: 3600,
};

app.use(cors(corsOptions));

/** définit les routes en utilisant les routeurs pour gérer les requêtes correspondantes. */
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/gestionnaire', gestionnaireRouter);
app.use('/admin', adminRouter);
app.use('/events', eventsRouter);
app.use('/etudiant', etudiantRouter);

// Exécution du script pour créer l'utilisateur par défaut
// createDefaultUser();

// Configuration du middleware body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
