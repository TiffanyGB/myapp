const { body } = require('express-validator');


/*Vérifier si les id données sont bien des nombres */
function idNombre(str) {
  return /^\d+$/.test(str);
}

function verifIdNombre(id, res){

  if (!idNombre(id)) {
    return -1;
  }
}

/*Tous les nombres provenant de body doivent être vérifiés */
async function validateUserId(idUser, req, res) {
  await body(idUser)
      .notEmpty().withMessage('L\'id ne doit pas être vide.')
      .matches(/^[0-9]*$/).withMessage("L\'id ne doit avoir que des chiffres.")
      .custom((value) => {
          if (/^[0-9]*$/.test(value)) {
              return value >= 1 && value <= 999999999;
          }
          return false;
      }).withMessage('L\'id est trop long.')
      .run(req);
}

module.exports = {verifIdNombre, validateUserId}
