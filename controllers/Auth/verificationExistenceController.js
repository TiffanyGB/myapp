const pool = require('../../database/configDB');

function verifExistence(values) {
  const verifExistence = `SELECT * FROM UTILISATEUR WHERE (pseudo = $1) OR (email = $2)`;

  return new Promise((resolve, reject) => {
    pool.query(verifExistence, values)
      .then((result) => {
        if (result.rows.length > 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function existePseudo(pseudo) {
  const verif = `SELECT * FROM utilisateur WHERE (pseudo = $1)`;

  return new Promise((resolve, reject) => {
    pool.query(verif, [pseudo])
      .then((result) => {
        if (result.rows.length === 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function existeMail(mail) {
  const verif = `SELECT * FROM utilisateur WHERE (email = $1)`;

  return new Promise((resolve, reject) => {
    pool.query(verif, [mail])
      .then((result) => {
        if (result.rows.length === 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

module.exports = {
  existeMail,
  existePseudo,
  verifExistence
}