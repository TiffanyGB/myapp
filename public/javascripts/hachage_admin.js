const bcrypt = require('bcrypt');
const pool = require('../../database/configDB');
const fmdp = require('../javascripts/index/fonctions_mdp');

const createDefaultUser = async () => {
    try {
        const password = 'admin';

        /* Génération du mot de passe */
        const hashedPassword = await fmdp.salageMdp(password);

        const query = `
            INSERT INTO Utilisateur (nom, prenom, pseudo, email, date_inscription, hashMdp, typeUser)
            VALUES ('admin', 'admin', 'admin', 'admin@admin.fr', CURRENT_DATE, $1, 'administrateur')
        `;

        const params = [hashedPassword];

        await pool.query(query, params);

        console.log('Utilisateur par défaut créé avec succès');
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur par défaut:', error);
    }
};

const createDefaultAdmin = async () => {
    try {    
        const query = `
            INSERT INTO Admini (idAdmin)
            VALUES (1)
        `;

        await pool.query(query);

        console.log('Admin par défaut créé avec succès');
    } catch (error) {
        console.error('Erreur lors de la création de l\'admin par défaut:', error);
    }
}

(async () => {
    try {
        await createDefaultUser();
        await createDefaultAdmin();
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur/admin par défaut:', error);
    } finally {
        pool.end();
    }
})();
