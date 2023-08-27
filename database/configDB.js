const { Pool } = require('pg');

const pool = new Pool({
  user: 'test44',
  password: 'iapau',
  host: 'localhost',
  database: 'iapau',
  port: '5432',
});

pool.connect();
module.exports = pool;
