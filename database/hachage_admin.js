const pool = require('./configDB');
const fi = require('../public/javascripts/index/fonctions_inscription');
const passwordModel = require('../models/passwordModel');


const valeurs = ['admin', 'admin'];


const createDefaultUser = async () => {
    try {
        const password = 'Admin2023!';

        /* Génération du mot de passe */
        const nonExiste = await fi.verifExistence(valeurs);

        if (nonExiste) {
            const hashedPassword = await passwordModel.salageMdp(password);

            const query = `
                INSERT INTO Utilisateur (nom, prenom, pseudo, email, date_inscription, hashMdp, typeUser)
                VALUES ('admin', 'admin', 'admin', 'admin@admin.fr', CURRENT_DATE, $1, 'administrateur')
            `;

            const params = [hashedPassword];

            await pool.query(query, params);
    
            console.log('Utilisateur par défaut créé avec succès');

        }
        else{
            console.log('Utilisateur par défaut existe déjà');
        }

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
    let errorOccurred = false;
    try {
        await createDefaultUser();
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur par défaut:', error);
        errorOccurred = true;
    }

    if (!errorOccurred) {
        try {
            await createDefaultAdmin();
        } catch (error) {
            console.error('Erreur lors de la création de l\'admin par défaut:', error);
        }
    }

    pool.end();

    process.exit();
})();
