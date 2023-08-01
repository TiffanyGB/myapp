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


module.exports = { verifId,verifIdEquipe };


