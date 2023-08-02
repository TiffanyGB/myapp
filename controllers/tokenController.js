/**
 * @fileoverview Fonctions liées aux token.
 * @module Token
 */

const jwt = require('jsonwebtoken');
const tokenModel = require('../models/tokenModel');

function verifierToken(req, res) {
  if (req.method === 'OPTIONS') {

  } else if (req.method === 'POST') {

    const token = req.body.token;

    res.status(200).json(token)
  }
}


async function supprimerToken(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).json({ sucess: 'Agress granted' });
  } else if (req.method === 'DELETE') {

    try {
      const token = req.body.token;

      const existe = await tokenModel.chercherToken(token);

      if (existe.length === 0) {
        return res.status(200).json({ message: "Le token n'existe pas." });
      }

      tokenModel.supprimerJWT(token);

      return res.status(200).json({ message: "JWT supprimé." });
    } catch {
      res.status(400).json({ error: "Erreur lors de la suppression du JWT." });
    }
  }
}


module.exports = {
  verifierToken,
  supprimerToken
};