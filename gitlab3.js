const axios = require('axios');

// function genererChaineAleatoire(longueur) {


//   const caracteresPossibles = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   let chaineAleatoire = '';

//   for (let i = 0; i < longueur; i++) {
//     const caractereAleatoire = caracteresPossibles[Math.floor(Math.random() * caracteresPossibles.length)];
//     chaineAleatoire += caractereAleatoire;
//   }

//   return chaineAleatoire;
// }

function creerDossier(nomEquipe, nom_event) {
  const gitlabBaseUrl = 'https://gitlab.com/api/v4/';
  const idProjet = '48369960';
  const accessToken = 'glpat-oE7qvER3ewf4PUohzy5t';

  const endpoint = `/projects/${encodeURIComponent(idProjet)}/repository/commits`;

  const messageCommit = 'Ajout du dossier de l\'équipe ' + nomEquipe;
  const branch = 'main';

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


async function recupererJSON(nomEquipe, event) {
  const gitlabBaseUrl = 'https://gitlab.com/api/v4/';
  const idProjet = '48369960';
  const accessToken = 'glpat-oE7qvER3ewf4PUohzy5t';
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
      let endpointFichier = `projects/${idProjet}/repository/files/${encodeURIComponent(eventEquipe)}` + '%2F' +fichierCourant + '/raw?ref=main';

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

// (async () => {
//   const a = await recupererJSON('elephantelKAhvTPzjJk8KhBuogB', 'Événement 1');
//   console.log(a);
// })();

module.exports = { creerDossier, recupererJSON }
