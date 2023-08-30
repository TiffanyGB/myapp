var createError = require('http-errors');
const bodyParser = require('body-parser');
const fs = require('fs');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

try {
  const env = require('../environnement.json');
  const port = env.frontend.port;
  var app_front = express();
  app_front.use(express.static(path.join(__dirname, '../frontend')));
  app_front.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
  });
  const corsOptions = {
    origin: '*',
    methods: 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
    allowedHeaders: 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, method',
    maxAge: 3600,
  };
  
  app_front.use(cors(corsOptions));
  app_front.listen(port);
} catch (e) {
  console.log("Erreur lors du chargement de l'application !");
}

/**crée une instance de l'application Express */
var app = express();

/*Routes */
var eventsRouter = require('../routes/events');
var indexRouter = require('../routes/index');
var projetRouter = require('../routes/projet');
var usersRouter = require('../routes/users');
var gestionnaireRouter = require('../routes/gestionnaire');
var teamsRouter = require('../routes/teams');
var messageRouter = require('../routes/message');

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
app.use('/events', eventsRouter);
app.use('/', indexRouter);
app.use('/projet', projetRouter);
app.use('/users', usersRouter);
app.use('/gestionnaire', gestionnaireRouter);
app.use('/teams', teamsRouter);
app.use('/message', messageRouter);


// Gestionnaire pour les routes inexistantes
app.use((req, res, next) => {
  res.status(404).send("Page not found");
});

// Configuration du middleware body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
