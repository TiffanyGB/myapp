const axios = require('axios');

const gitlabAPIUrl = 'https://gitlab.com/api/v4';
const personalAccessToken = 'glpat-oE7qvER3ewf4PUohzy5t';
const projectId = 'test2'; // L'ID du référentiel GitLab (encodé pour les URL)
const directoryName = 'new_directory_name'; // Nom du dossier à créer

const createGitLabDirectory = async () => {
  try {
    const apiUrl = `${gitlabAPIUrl}/projects/${projectId}/repository/directories`;
    const response = await axios.post(
      apiUrl,
      {
        path: directoryName,
        branch: 'master', // Branche dans laquelle créer le dossier
        commit_message: `Create ${directoryName} directory`
      },
      {
        headers: {
          'PRIVATE-TOKEN': personalAccessToken
        }
      }
    );

    console.log(`GitLab directory ${directoryName} created successfully.`);
    console.log(response.data);
  } catch (error) {
    console.error('Error creating GitLab directory:', error.response ? error.response.data : error.message);
  }
};

// Appel de la fonction pour créer le dossier
createGitLabDirectory();
