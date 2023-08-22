const { Pool } = require('pg');

const pool = new Pool({
  user: 'administrateur',
  password: 'iaPauPassword',
  host: 'localhost',
  database: 'iapau',
  port: '5432',
});

pool.connect();
module.exports = pool;

