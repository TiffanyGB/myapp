const pool = require('../../database/configDB');
const userModel = require('../../models/userModel');

async function modifierExterne(idUser, valeurs, metier, entreprise, password) {

    try {
        const result = await userModel.modifierUser(idUser, valeurs, password)

        if (result === 'les2') {
            return 'les2';
        } else if (result === 'pseudo') {
            return 'pseudo';
        }
        else if (result === 'mail') {
            return 'mail';
        }

        const student = `UPDATE Gestionnaire_externe
            SET entreprise = '${entreprise}',
            metier = '${metier}' 
            WHERE id_g_externe = ${idUser}`;

        try {
            pool.query(student);
        }
        catch (error) {
            throw error;
        }
    } catch (error) {
        throw error;
    }
}

async function modifierIapau(idUser, valeurs, role_asso, password) {
    try {

        const result = await userModel.modifierUser(idUser, valeurs, password)

        if (result === 'les2') {
            return 'les2';
        } else if (result === 'pseudo') {
            return 'pseudo';
        }
        else if (result === 'mail') {
            return 'mail';
        }

        const student = `UPDATE Gestionnaire_iapau
                SET role_asso = '${role_asso}'
                WHERE id_g_iapau = ${idUser}`;

        try {
            pool.query(student);
        }
        catch (error) {
            throw error;
        }

    } catch (error) {
        throw error;
    }
}

module.exports = {
    modifierExterne,
    modifierIapau
}