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

function creerDossier(nomEquipe) {
  const gitlabBaseUrl = 'https://gitlab.com/api/v4/';
  const idProjet = '48219512';
  const accessToken = 'glpat-oE7qvER3ewf4PUohzy5t';

  const endpoint = `/projects/${encodeURIComponent(idProjet)}/repository/commits`;

  const messageCommit = 'Ajout du nouveau dossier';
  const branch = 'main';

  const aleatoire = genererChaineAleatoire(20);
  const nomDossier = nomEquipe + aleatoire;

  const commitContent = {
    branch,
    commit_message: messageCommit,
    actions: [
      {
        action: 'create',
        file_path: `${nomDossier}/.gitkeep`,
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
}

// Appeler la fonction pour créer le dossier
creerDossier('ekip');
