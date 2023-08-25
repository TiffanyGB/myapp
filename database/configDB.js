const { Pool } = require('pg');

const environnement = require('../../environnement.json');t
const database = environnement.backend.database;

const pool = new Pool({
  user: database.user,
  password: database.password,
  host: database.port,
  database: database.database,
  port: database.port,
});

pool.connect();
module.exports = pool;

