const axios = require('axios');

const gitlabAPIUrl = 'https://gitlab.com/';
const personalAccessToken = 'glpat-oE7qvER3ewf4PUohzy5t';
const projectId = 'test'; // L'ID du référentiel GitLab
const teamName = 'YourTeamName'; // Le nom de l'équipe

const createGitLabDirectory = async (directoryName) => {
  const apiUrl = `${gitlabAPIUrl}/projects/${projectId}/repository/directories`;
  
  try {
    const response = await axios.post(apiUrl, {
      path: directoryName,
      branch: 'master', // Branche dans laquelle créer le dossier
      commit_message: `Create ${directoryName} directory`
    }, {
      headers: {
        'PRIVATE-TOKEN': personalAccessToken
      }
    });

    console.log(`GitLab directory ${directoryName} created successfully.`);
    console.log(response.data);
  } catch (error) {
    console.error('Error creating GitLab directory:', error.response ? error.response.data : error.message);
  }
};

// Appel de la fonction pour créer le dossier de l'équipe
createGitLabDirectory(teamName);
