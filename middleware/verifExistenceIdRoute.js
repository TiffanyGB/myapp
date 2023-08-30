const pool = require('../database/configDB');

async function verifId(res, next, id, nomId, table) {
  const chercher = `SELECT * FROM ${table} WHERE ${nomId} = $1`;

  try {
    const result = await pool.query(chercher, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erreur: 'L\'id n\'existe pas' });
    }
  } catch (error) {
    throw error;
  }
}

/**Vérifier si existe equipe */
async function verifIdEquipe(req, res, next) {
  const id = req.params.id;

  const chercher = `SELECT * FROM Equipe WHERE idEquipe = $1`;

  try {
    const result = await pool.query(chercher, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erreur: 'L\'id de cette équipe n\'existe pas' });
    }

    next();
  } catch (error) {
    next(error); 
  }
}

/**Vérifier si existe equipe */
async function verifIdUser(req, res, next) {
  const id = req.params.id;

  const chercher = `SELECT * FROM Utilisateur WHERE idUser = $1`;

  try {
    const result = await pool.query(chercher, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erreur: 'L\'id de cet utilisateur n\'existe pas' });
    }

    next();
  } catch (error) {
    next(error); 
  }
}

/**Vérifier si existe event */
async function verifIdEvent(req, res, next) {
  const id = req.params.id;

  const chercher = `SELECT * FROM Evenement WHERE idEvent = $1`;

  try {
    const result = await pool.query(chercher, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erreur: 'L\'id de cet événement n\'existe pas' });
    }

    next();
  } catch (error) {
    next(error); 
  }
}
/**Vérifier si existe projet */
async function verifIdProjet(req, res, next) {
  const id = req.params.id;

  const chercher = `SELECT * FROM Projet WHERE idProjet = $1`;

  try {
    const result = await pool.query(chercher, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erreur: 'L\'id de ce projet n\'existe pas' });
    }

    next();
  } catch (error) {
    next(error); 
  }
}

/*Demande deja envoyée */

module.exports = { verifId,verifIdEquipe, verifIdEvent, verifIdProjet, verifIdUser };


