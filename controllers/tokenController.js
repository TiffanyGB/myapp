const jwt = require('jsonwebtoken');


function verifierToken(req, res) {
    if (req.method === 'OPTIONS') {
  
    } else if (req.method === 'POST') {
        
      const token = req.body.token;

      res.status(200).json(token)
    }
  }


module.exports = {
    verifierToken
};