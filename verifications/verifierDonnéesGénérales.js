/*Vérifier si les id données sont bien des nombres */
function idNombre(str) {
  return /^\d+$/.test(str);
}

function verifIdNombre(id, res){

  if (!idNombre(id)) {
    return -1;
  }
}

module.exports = {verifIdNombre}
