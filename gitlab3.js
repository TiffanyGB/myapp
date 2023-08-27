const axios = require('axios');


/* */
const idProjet = '5';
const gitlabBaseUrl = 'http://10.0.12.111/api/v4';
const accessToken = 'glpat-aDuBCdH2VwA68epzVYd3';

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

function creerRepertoire(idEquipe, id_user) {

  const endpoint = `/projects/user/${id_user}`;

  const nomEquipe = 'Equipe_' + idEquipe;

  const commitContent = {
    name: nomEquipe,
    user_id: id_user
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

//Créer utilisateur,
async function creerUtilisateur(nom_equipe) {

  const endpoint = `/users`;

  const mdp = genererChaineAleatoire(10);
  const username = nom_equipe + "_" + genererChaineAleatoire(4);
  const email = "equipe" + genererChaineAleatoire(3) + "@gaia-iapau.fr"

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

    const valeurs_equipe = [mdp, commitContent.email, id_compte_gitlab];
    return valeurs_equipe;

  }catch{ (error)
    console.error('Erreur lors de la requête API GitLab :', error);
  }
}


module.exports = { creerDossier, recupererJSON, creerRepertoire, creerUtilisateur }




























// function supprimerDossierEquipe(nomEquipe, event) {
  //   const eventEquipe = '' + event + '/' + nomEquipe;
  
  //   const endpoint = `/projects/${idProjet}/repository/tree?path=${encodeURIComponent(eventEquipe)}`;
  
  //   const headers = {
  //     'PRIVATE-TOKEN': accessToken,
  //   };
  // }