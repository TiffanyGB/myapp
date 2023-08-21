const axios = require('axios');

const idProjet = '48423057';
const gitlabBaseUrl = 'https://gitlab.com/api/v4/';
const accessToken = 'glpat-oE7qvER3ewf4PUohzy5t';


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

  axios.post(`${gitlabBaseUrl}${endpoint}`, commitContent, { headers })
    .then(response => {
      console.log('Dossier créé avec succès.');
    })
    .catch(error => {
      console.error('Erreur lors de la requête API GitLab :', error);
    });

  return nomEquipe;
}

async function recupererJSON(idEquipe, event) {
  const nomEquipe = 'Equip_' + idEquipe;
  const eventEquipe = '' + event + '/' + nomEquipe;

  const endpoint = `/projects/${idProjet}/repository/tree?path=${encodeURIComponent(eventEquipe)}`;

  const headers = {
    'PRIVATE-TOKEN': accessToken,
  };

  try {
    const response = await axios.get(`${gitlabBaseUrl}${endpoint}`, { headers });
    const fichiers = response.data;
    const nbFichiers = fichiers.length;
    const contenuFichiers = [];

    let endpointFichierPromises = [];

    for (let i = 0; i < nbFichiers; i++) {
      let fichierCourant = fichiers[i].name;
      let endpointFichier = `projects/${idProjet}/repository/files/${encodeURIComponent(eventEquipe)}` + '%2F' + fichierCourant + '/raw?ref=main';

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

function creerRepertoire(idEquipe) {

  const endpoint = `/projects/`;

  const messageCommit = 'Création du repo ';
  const branch = 'main';

  const nomEquipe = 'Equipe_' + idEquipe;

  const commitContent = {
    branch,
    commit_message: messageCommit,
    actions: [
      {
        name: nomEquipe
      },
    ],
  };

  const headers = {
    'PRIVATE-TOKEN': accessToken,
  };

  axios.post(`${gitlabBaseUrl}${endpoint}`, commitContent, { headers })
    .then(response => {
      console.log('Dossier créé avec succès.');
    })
    .catch(error => {
      console.error('Erreur lors de la requête API GitLab :', error);
    });

  return nomEquipe;
}



//Créer utilisateur

function supprimerDossierEquipe(nomEquipe, event) {
  const eventEquipe = '' + event + '/' + nomEquipe;

  const endpoint = `/projects/${idProjet}/repository/tree?path=${encodeURIComponent(eventEquipe)}`;

  const headers = {
    'PRIVATE-TOKEN': accessToken,
  };
}


// (async () => {
//   const a = await recupererJSON('elephantelKAhvTPzjJk8KhBuogB', 'Événement 1');
//   console.log(a);
// })();

module.exports = { creerDossier, recupererJSON, creerRepertoire }
