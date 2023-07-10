const pool = require('./configDB');
const passwordModel = require('../models/passwordModel');
const verificationExistence = require('../controllers/Auth/verificationExistenceController');
const userModel = require('../models/userModel');


const valeurs = ['admin', 'admin@admin.fr'];


const createDefaultUser = async () => {
    try {
        const password = 'Admin2023!';

        /**Aucun utilisateur ne possède le même pseudo ou email */
        const nonExiste = await verificationExistence.verifExistence(valeurs);

        if (!nonExiste) {

            const idUser = await userModel.chercherUserPseudo(valeurs[0]);
            const supprimer = await userModel.supprimerUser(idUser, 'admini');
        }

        const hashedPassword = await passwordModel.salageMdp(password);

        const query = `
                INSERT INTO Utilisateur (nom, prenom, pseudo, email, date_inscription, hashMdp, typeUser)
                VALUES ('admin', 'admin', 'admin', 'admin@admin.fr', CURRENT_TIMESTAMP, $1, 'administrateur')
            `;

        const params = [hashedPassword];

        /**Insertion dans la bdd */
        await pool.query(query, params);

        console.log('Utilisateur par défaut créé avec succès');




    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur par défaut:', error);
    }
};

const createDefaultAdmin = async (pseudo) => {
    try {
        const idUser = await userModel.chercherUserPseudo(pseudo);
        const query = `
            INSERT INTO Admini (idAdmin)
            VALUES ($1)
        `;

        const mdp = [idUser];

        await pool.query(query, mdp);

        console.log('Admin par défaut créé avec succès');
    } catch (error) {
        console.error('Erreur lors de la création de l\'admin par défaut:', error);
    }
}

(async () => {
    let errorOccurred = false;
    try {
        await createDefaultUser();
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur par défaut:', error);
        errorOccurred = true;
    }

    if (!errorOccurred) {
        try {
            await createDefaultAdmin('admin');
        } catch (error) {
            console.error('Erreur lors de la création de l\'admin par défaut:', error);
        }
    }

    pool.end();

    process.exit();
})();
