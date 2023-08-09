const passwordModel = require('../../models/passwordModel');

const pool = require('../../database/configDB');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const tokenModel = require('../../models/tokenModel');

const generateSecretKey = () => {
    return crypto.randomBytes(64).toString('hex');
};
const secretKey = generateSecretKey();


/**
 * Connexion d'un utilisateur.
 * @param {object} req - L'objet de requête HTTP.
 * @param {object} res - L'objet de réponse HTTP.
 * @returns {object} Un JSON contenant le token généré, les informations de l'utilisateur suivantes:
 * id, nom, prénom, pseudo, rôle (Etudiant, gestionnaire externe, gestionnaire IA Pau, administrateur)
 * @throws {Error}Erreur lors de la requete qui recherche un utilisateur ayant le même identifiant.
 * @description Cette fonction permet à un utilisateur de se connecter à son compte avec un login/email et un mot de passe.
 * @headers
 *    {string} Authorization - Token d'authentification JWT.
 */
async function connexion(req, res) {
    if (req.method === 'POST') {

        const identifiant = req.body.identifiant;
        const password = req.body.password;
        const seSouvenir = req.body.seSouvenir;

        try {
            const requeteChercher = `SELECT * FROM Utilisateur WHERE (email=$1) OR (pseudo=$1)`;
            const result = await pool.query(requeteChercher, [identifiant]);

            /** Aucun email ou pseudo ne correspond*/
            if (result.rowCount === 0) {
                return res.status(400).json({ champ: 'login', message: 'Aucun email/login ne correspond' });
            } else {
                const user = result.rows[0];
                const match = await passwordModel.comparerMdp(password, user.hashmdp);

                if (match) {

                    /**  Informations à insérer dans le token */
                    const payload = {
                        "utilisateurId": user.iduser,
                        "utilisateurType": user.typeuser
                    };

                    /**  Générer le JWT */
                    let temps;
                    if (seSouvenir) {
                        temps = '30d'
                    } else {
                        temps = '24h';
                    }
                    const token = jwt.sign(payload, secretKey, { expiresIn: temps });
                    tokenModel.stockerJWT(token, secretKey);

                    return res.status(200).json({ token: token, id: user.iduser, prenom: user.prenom, nom: user.nom, pseudo: user.pseudo, role: user.typeuser });
                } else {
                    return res.status(400).json({ champ: 'mot de passe', message: 'Le mot de passe est incorrect' });
                }
            }
        } catch (error) {
            return res.status(400).json('Erreur lors de l\'exécution de la requête');
        }
    }
}

module.exports = { connexion }