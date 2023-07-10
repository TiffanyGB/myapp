// const pool = require('../../../database/configDB');
// const userModel = require('../../../models/userModel');
// const verifExistenceController = require('../../../controllers/Auth/verificationExistenceController');

// async function insererEtudiant(values, pseudo) {

//   try {
//     const idUser = await userModel.chercherUserPseudo(pseudo);

//     const requet = `INSERT INTO etudiant (idEtudiant, ecole, niveau_etude, code_postale_ecole)
//       VALUES ('${idUser}', $1, $2, $3)`;

//     return new Promise((resolve, reject) => {
//       pool.query(requet, values)
//         .then(() => {
//           resolve(true);
//         })
//         .catch((error) => {
//           console.error('Fichier "' + __filename + '" fonction: "' + arguments.callee.name + ':\nErreur lors de l\'insertion des données côté etudiant (requete sql)', error);
//           reject(error);
//         });
//     });
//   } catch (error) {
//     console.error('Fichier "' + __filename + '" fonction: "' + arguments.callee.name + ':\nErreur lors de l\'insertion des données côté etudiant (requete sql).', error);
//     throw error;
//   }
// }

// module.exports = {
//   insererUser,
//   insererMdp,
//   insererEtudiant,

// };



