const pool = require('./configDB');
const passwordModel = require('../models/passwordModel');
const userModel = require('../models/userModel');

const valeurs = ['admin', 'admin@admin.fr'];

async function verifExistance() {
    const query = 'SELECT * FROM UTILISATEUR WHERE pseudo = $1 OR email = $2';
    const result = await pool.query(query, valeurs);
    return result.rows.length > 0;
}

async function createDefaultUser() {
    try {
        const password = 'Admin2023!';

        if (await verifExistance()) {
            const idUser = await userModel.chercherUserPseudo(valeurs[0]);
            userModel.supprimerUser(idUser);
        }

        const hashedPassword = await passwordModel.salageMdp(password);

        const insertQuery = `
            INSERT INTO Utilisateur (nom, prenom, pseudo, email, date_inscription, hashMdp)
            VALUES ('admin', 'admin', 'admin', 'admin@admin.fr', CURRENT_TIMESTAMP, $1) 
            RETURNING iduser`;

        const params = [hashedPassword];

        const id = await pool.query(insertQuery, params);
        return id.rows[0].iduser;
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur par défaut:', error);
    }
}

async function createDefaultAdmin(idUser) {
    try {
        const insertQuery = 'INSERT INTO Admini (idAdmin) VALUES ($1)';

        await pool.query(insertQuery, [idUser]);

        console.log('Admin par défaut créé avec succès');
    } catch (error) {
        console.error('Erreur lors de la création de l\'admin par défaut:', error);
    }
}

(async () => {
    try {
        const id = await createDefaultUser();
        await createDefaultAdmin(id);
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur ou de l\'admin par défaut:', error);
    } finally {
        pool.end();
        process.exit();
    }
})();
