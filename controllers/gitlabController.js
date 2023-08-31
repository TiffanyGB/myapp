const axios = require('axios');

var env = require('../environnement.json');
var gitlab = env.app.computationImpact.gitlab;
const idProjet = gitlab.idProjet;
const gitlabBaseUrl = gitlab.api_gitlab;
const accessToken = gitlab.token;

function genererChaineAleatoire(longueur) {
  const caracteresPossibles = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let chaineAleatoire = '';

  for (let i = 0; i < longueur; i++) {
    const caractereAleatoire = caracteresPossibles[Math.floor(Math.random() * caracteresPossibles.length)];
    chaineAleatoire += caractereAleatoire;
  }

  return chaineAleatoire;
}

/**Annexe */
function creerDossier(idEquipe, nom_event) {

  const endpoint = `/projects/${encodeURIComponent(idProjet)}/repository/commits`;

  const messageCommit = 'Ajout du dossier de l\'équipe ' + idEquipe;
  const branch = 'main';

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
    console.error('Erreur lors de la requête API GitLab :', error);
  }
}

/**Annexe */
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

//Créer utilisateur,
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
    console.log(reponse)
    return valeurs_equipe;

  }catch{ (error)
    console.error('Erreur lors de la requête API GitLab :', error);
    throw error;
  }
}

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
    const response = await axios.post(`${gitlabBaseUrl}${endpoint}`, commitContent, { headers });
    const forkedRepoId = response.data.id;
    return forkedRepoId;
  } catch (error) {
    console.error('Erreur lors de la requête API GitLab :', error);
    throw error;
  }
}




module.exports = { creerDossier, recupererJSON, creerUtilisateur, copieDuTemplate }




























// function supprimerDossierEquipe(nomEquipe, event) {
  //   const eventEquipe = '' + event + '/' + nomEquipe;
  
  //   const endpoint = `/projects/${idProjet}/repository/tree?path=${encodeURIComponent(eventEquipe)}`;
  
  //   const headers = {
  //     'PRIVATE-TOKEN': accessToken,
  //   };
  // }