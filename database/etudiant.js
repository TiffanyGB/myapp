const pool = require('./configDB');
const passwordModel = require('../models/passwordModel');
const verificationExistence = require('../verifications/verif_pseudo_mail_libres');
const userModel = require('../models/userModel');


const valeurs = ['test1', 'test1@etudiant.fr'];
const valeurs2 = ['test2', 'test2@etudiant.fr'];


const createDefaultUser1 = async () => {
    try {
        const password = 'Admin2023!';

        /**Aucun utilisateur ne possède le même pseudo ou email */
        const nonExiste = await verificationExistence.verifExistence(valeurs);

        if (!nonExiste) {

            const idUser = await userModel.chercherUserPseudo(valeurs[0]);
            userModel.supprimerUser(idUser);
        }

        const hashedPassword = await passwordModel.salageMdp(password);

        const query = `
                INSERT INTO Utilisateur (nom, prenom, pseudo, email, date_inscription, hashMdp, typeUser)
                VALUES ('test1', 'test1', 'test1', 'test1@etudiant.fr', CURRENT_TIMESTAMP, $1, 'etudiant')
            `;

        const params = [hashedPassword];

        /**Insertion dans la bdd */
        await pool.query(query, params);

        console.log('Utilisateur par défaut créé avec succès');


    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur par défaut:', error);
    }
};

const createDefaultUser2 = async () => {
    try {
        const password = 'Admin2023!';

        /**Aucun utilisateur ne possède le même pseudo ou email */
        const nonExiste = await verificationExistence.verifExistence(valeurs2);

        if (!nonExiste) {

            const idUser = await userModel.chercherUserPseudo(valeurs2[0]);
            userModel.supprimerUser(idUser);
        }

        const hashedPassword = await passwordModel.salageMdp(password);

        const query = `
                INSERT INTO Utilisateur (nom, prenom, pseudo, email, date_inscription, hashMdp, typeUser)
                VALUES ('test2', 'test2', 'test2', 'test2@etudiant.fr', CURRENT_TIMESTAMP, $1, 'etudiant')
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
            INSERT INTO Etudiant (idEtudiant, ecole, niveau_etude)
            VALUES ($1, 'CY TECH', 'L1')`;

        const id = [idUser];

        await pool.query(query, id);

        console.log('Etudiant 1 ok par défaut créé avec succès');
    } catch (error) {
        console.error('Erreur lors de la création de l\'admin par défaut:', error);
    }
}

(async () => {
    let errorOccurred = false;
    try {
        await createDefaultUser1();
        await createDefaultUser2();
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur par défaut:', error);
        errorOccurred = true;
    }

    if (!errorOccurred) {
        try {
            await createDefaultAdmin('test1');
            await createDefaultAdmin('test2');
        } catch (error) {
            console.error('Erreur lors de la création de l\'admin par défaut:', error);
        }
    }

    pool.end();

    process.exit();
})();
