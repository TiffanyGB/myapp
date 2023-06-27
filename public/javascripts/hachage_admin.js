const bcrypt = require('bcrypt');
const pool = require('../../database/configDB');
const fmdp = require('./fonctions_mdp');



const createDefaultUser = async () => {
    try {
        const password = 'admin'; // Mot de passe en clair

        // Génération du sel
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);

        // Chiffrement du mot de passe
        const hashedPassword = bcrypt.hashSync(password, salt);

        const query = `
      INSERT INTO Utilisateur (nom, prenom, pseudo, email, date_inscription, hashMdp, typeUser)
      VALUES ('admin', 'admin', 'admin', 'admin@admin.fr', CURRENT_DATE, $1, 'administrateur')
    `;

        const params = [hashedPassword];

        await pool.query(query, params);

        console.log('Utilisateur par défaut créé avec succès');
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur par défaut:', error);
    } finally {
        pool.end();
    }
};

//createDefaultUser();

