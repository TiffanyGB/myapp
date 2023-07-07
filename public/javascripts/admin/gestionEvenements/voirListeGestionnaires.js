const pool = require('../../../../database/configDB');
const recherche = require('../../rechercheUsers');

async function listegestionnaireJSON(){

    try{
        const externes = await recherche.chercherTousGestionnaireExterne();

        if(externes === 0){
            return('aucun');
        }else{
            console.log(externes);
        }
    }catch{

    }
}

listegestionnaireJSON();

module.exports = {
    listegestionnaireJSON
}