const axios = require('axios');

function genererChaineAleatoire(longueur) {


  const caracteresPossibles = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let chaineAleatoire = '';

  for (let i = 0; i < longueur; i++) {
    const caractereAleatoire = caracteresPossibles[Math.floor(Math.random() * caracteresPossibles.length)];
    chaineAleatoire += caractereAleatoire;
  }

  return chaineAleatoire;
}

function creerDossier(nomEquipe, nom_event) {
  const gitlabBaseUrl = 'https://gitlab.com/api/v4/';
  const idProjet = '48369960';
  const accessToken = 'glpat-oE7qvER3ewf4PUohzy5t';

  const endpoint = `/projects/${encodeURIComponent(idProjet)}/repository/commits`;

  const messageCommit = 'Ajout du dossier de l\'équipe ' + nomEquipe;
  const branch = 'main';

  const aleatoire = genererChaineAleatoire(20);
  const nomDossier = nomEquipe + aleatoire;

  const commitContent = {
    branch,
    commit_message: messageCommit,
    actions: [
      {
        action: 'create',
        file_path: `${nom_event}/${nomDossier}/.gitkeep`,
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

  return nomDossier;
}


function recupererJSON(nomEquipe, event) {
  const gitlabBaseUrl = 'https://gitlab.com/api/v4/';
  const idProjet = '48369960';
  const accessToken = 'glpat-oE7qvER3ewf4PUohzy5t';
  const eventEquipe = '' + event + '/' + nomEquipe;

  const endpoint = `/projects/${idProjet}/repository/tree?path=${encodeURIComponent(eventEquipe)}`;

  const headers = {
    'PRIVATE-TOKEN': accessToken,
  };

  axios.get(`${gitlabBaseUrl}${endpoint}`, { headers })
    .then(response => {
      const fichiers = response.data;
      const nbFichiers = fichiers.length;

      let endpointFichier;
      for (i = 0; i < nbFichiers; i++) {
        let fichierCourant = fichiers[i].name;
        endpointFichier = `projects/${idProjet}/repository/files/${encodeURIComponent(eventEquipe)}` + '%2F' +fichierCourant + '/raw?ref=main';

        axios.get(`${gitlabBaseUrl}${endpointFichier}`, { headers })
          .then(contenu => {
            console.log(i , "  " , contenu.data)
          })
          .catch(error => {
            console.error('Erreur lors de la requête API GitLab :', error);
          });
      }


    })
    .catch(error => {
      console.error('Erreur lors de la requête API GitLab :', error);
    });
}

// recupererJSON('elephantelKAhvTPzjJk8KhBuogB', 'Événement 1');



module.exports = { creerDossier, recupererJSON }
