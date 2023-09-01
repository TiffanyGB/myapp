const axios = require('axios');

var env = require('../environnement.json');
var gitlab = env.app.computationImpact.gitlab;
const idProjet = gitlab.idProjet;
const gitlabBaseUrl = gitlab.api_gitlab;
const accessToken = gitlab.token;
const urlGitlab = gitlab.host;

/**
 * @function
 * @param {int} longueur - Longueur de la chaîne à retourner.
 * @description Permet de générer des chaînes de caractères aléatoires
 * 
 * @returns {String} Chaîne aléatoire
 */
function genererChaineAleatoire(longueur) {
  const caracteresPossibles = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let chaineAleatoire = '';

  for (let i = 0; i < longueur; i++) {
    const caractereAleatoire = caracteresPossibles[Math.floor(Math.random() * caracteresPossibles.length)];
    chaineAleatoire += caractereAleatoire;
  }

  return chaineAleatoire;
}

/**
 * @function
 * @param {String} nom_event - Nom de l'événement
 * @param {Int} idEquipe - Identifiant de l'équipe
 * @description Cette fonction permet de créer le dossier annexe sur GitLab qui sert
 * à récupérer les JSON de l'équipe.
 *  
 * Le dossier se trouve dans un dossier portant le nom de l'événement. 
 * Ce dernier est dans un repertoire dont l'identifant se trouve dans environement.json.
 * @example
 * Exemple d'adresse de dossier: 'Repertoire_iapau/Evenement_abc/equipe_4'.
 * L'équipe possédant l'id dans l'événement 'Evenement_abc' possède ses jsons à l'adresse précédente.
 * @throws {Error} Si la créaion a échoué.
*/
function creerDossier(idEquipe, nom_event) {

  const endpoint = `/projects/${encodeURIComponent(idProjet)}/repository/commits`;

  const messageCommit = 'Ajout du dossier de l\'équipe ' + idEquipe;
  const branch = 'main';

  /*Nom du dossier */
  const nomEquipe = 'Equipe_' + idEquipe;

  const commitContent = {
    branch,
    commit_message: messageCommit,
    actions: [
      {
        action: 'create',
        file_path: `${nom_event}/${nomEquipe}/.gitkeep`,
        content: '',
      },
    ],
  };

  const headers = {
    'PRIVATE-TOKEN': accessToken,
  };

  try {
    axios.post(`${gitlabBaseUrl}${endpoint}`, commitContent, { headers })

  } catch {
    throw (error);
  }
}

/**
 * @async
 * @function
 * @param {String} event - Nom de l'événement
 * @param {Int} idEquipe - Identifiant de l'équipe
 * @description Cette fonction permet de récupérer les json d'une équipe dans son dossier
 * annexe associé.
 * Les fichiers autres que .json sont ignorés.
 * 
 * Le nombre de fichiers dans le dossier est récupéré. Puis, le contenu de chaque fichier json est récupéré.
 * @throws {Error} Si la récupération a échoué.
 * @returns {Array} Un tableau contenant tous les json de l'équipe.

*/
async function recupererJSON(idEquipe, event) {
  const nomEquipe = 'Equipe_' + idEquipe;
  const eventEquipe = '' + event + '/' + nomEquipe;

  /* Lien pour récupérer l'ensemble des fichiers du répertoire de l'équipe */
  const endpoint = `/projects/${idProjet}/repository/tree?path=${encodeURIComponent(eventEquipe)}`;

  const headers = {
    'PRIVATE-TOKEN': accessToken,
  };

  try {
    const response = await axios.get(`${gitlabBaseUrl}${endpoint}`, { headers });
    const fichiers = response.data;

    // Filtrer les fichiers pour ne conserver que ceux avec l'extension ".json"
    const fichiersJSON = fichiers.filter(fichier => fichier.name.endsWith('.json'));

    const nbFichiersJSON = fichiersJSON.length;

    const contenuFichiers = [];

    let endpointFichierPromises = [];

    for (let i = 0; i < nbFichiersJSON; i++) {
      let fichierCourant = fichiersJSON[i].name;

      let endpointFichier = `/projects/${idProjet}/repository/files/${encodeURIComponent(eventEquipe)}` + '%2F' + `${encodeURIComponent(fichierCourant)}` + '/raw?ref=main';
      endpointFichierPromises.push(
        axios.get(`${gitlabBaseUrl}${endpointFichier}`, { headers })
          .then(contenu => contenu.data)
          .catch(error => {
            console.error('Erreur lors de la requête API GitLab :', error);
            return null;
          })
      );
    }

    const contenuFichiersResolved = await Promise.all(endpointFichierPromises);
    contenuFichiersResolved.forEach(contenu => {
      if (contenu !== null) {
        contenuFichiers.push(contenu);
      }
    });

    return contenuFichiersResolved;
  } catch (error) {
    console.error('Erreur lors de la requête API GitLab :', error);
    return [];
  }
}

/**
 * @async
 * @function
 * @param {String} nom_equipe - Nom de l'équipe
 * @description Cette fonction permet de créer un nouvel utilisateur sur GitLab.
 * 
 * Une adresse-mail, un mot de passe et un pseudo sont générés aléatoirement.
 * Les identifiants seront transmis à l'équipe.
 * @returns {Array} Tableau contenant le mot de passe, l'email, l'identifiant du compte et le l'id du namespace. 
 * @throws {Error} Si la création a échoué.
*/
async function creerUtilisateur(nom_equipe) {

  const endpoint = `/users`;

  const mdp = genererChaineAleatoire(10);
  const username = nom_equipe + "_" + genererChaineAleatoire(4);
  const email = "equipe" + genererChaineAleatoire(8) + "@gaia-iapau.fr"

  const commitContent = {
    email: email,
    password: mdp,
    username: username,
    name: nom_equipe,
  };


  const headers = {
    'PRIVATE-TOKEN': accessToken,
  };

  try{
    const reponse = await axios.post(`${gitlabBaseUrl}${endpoint}`, commitContent, { headers })
    const id_compte_gitlab = reponse.data.id;
    const namespace_id = reponse.data.namespace_id;

    const valeurs_equipe = [mdp, commitContent.email, id_compte_gitlab, namespace_id];
    return valeurs_equipe;

  }catch{ (error)
    throw error;
  }
}

/**
 * @async
 * @function
 * @param {Int} idTemplate - Id du template du projet
 * @param {String} idEquipe - Id de l'équipe
 * @param {String} namespace_id - Id du namespace gitlab de l'équipe
 * @description Cette fonction permet de faire une copie du répo contenant le template du projet
 * et d'associer cette copie à l'équipe (grâce au namaspace).
 * 
 * @throws {Error} Si la copie a échoué.
*/
async function copieDuTemplate(idTemplate, idEquipe,namespace_id) {
  const endpoint = `/projects/${idTemplate}/fork`;
  const commitContent = {
    "name": "Equipe_" + idEquipe,
    "namespace_id": namespace_id
  };
  const headers = {
    'PRIVATE-TOKEN': accessToken,
  };

  try {
    await axios.post(`${gitlabBaseUrl}${endpoint}`, commitContent, { headers });
  } catch (error) {
    throw error;
  }
}

async function recupererIDTemplate(chemin_template){

  let chemin = chemin_template.split(urlGitlab);
  chemin = encodeURIComponent(chemin[1]);

  const endpoint = `/projects/${chemin}/`;
  const headers = {
    'PRIVATE-TOKEN': accessToken,
  };

  try {
    const idTemplate = await axios.get(`${gitlabBaseUrl}${endpoint}`, { headers });
    return idTemplate.data.id;
  } catch (error) {
    throw error;
  }
}

module.exports = { creerDossier, recupererJSON, creerUtilisateur, copieDuTemplate, recupererIDTemplate }




























// function supprimerDossierEquipe(nomEquipe, event) {
  //   const eventEquipe = '' + event + '/' + nomEquipe;
  
  //   const endpoint = `/projects/${idProjet}/repository/tree?path=${encodeURIComponent(eventEquipe)}`;
  
  //   const headers = {
  //     'PRIVATE-TOKEN': accessToken,
  //   };
  // }