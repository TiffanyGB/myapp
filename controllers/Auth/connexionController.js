/**
 * @fileoverview Controller de la connexion
 * @module Connexion
 * 
 * @version 1.0.0 
 * @author Tiffany GAY-BELLILE <tiffany.gbellile@gmail.com>
 * 
 * @requires ../../models/passwordModel
 * @requires ../../models/tokenModel
 * @requires ../../database/configDB
 * @requires jsonwebtoken
 */

const passwordModel = require('../../models/passwordModel');
const pool = require('../../database/configDB');
const jwt = require('jsonwebtoken');
const tokenModel = require('../../models/tokenModel');
const { chercherType } = require('../../models/userModel');

/**
 * Connexion d'un utilisateur.
 * @async
 * @param {object} req - L'objet de requête HTTP.
 * @param {object} res - L'objet de réponse HTTP.
 * @returns {object} Un JSON contenant le token généré, les informations de l'utilisateur suivantes:
 * id, nom, prénom, pseudo, rôle (Etudiant, gestionnaire externe, gestionnaire IA Pau, administrateur)
 * @description Cette fonction permet à un utilisateur de se connecter à son compte avec. Si la connexion
 * a échoué, un code 400 est retourné avec un message d'erreur.
 * un login/email et un mot de passe.
 * 
 * Le champ 'identifiant' peut être un pseudo ou une adresse mail.
 * Le champ 'seSouvenir' vaut 'true' si l'utilisteur a coché cette option sur la page de connexion,
 * 'false' dans le cas contraire. Ce champ permet d'ajuster la date d'expiration du token, plus longue
 * si il vaut 'true'.
 * @headers
 *    {string} Authorization - Token d'authentification JWT.
 */
async function connexion(req, res) {
    if (req.method === 'POST') {

        /*Récupération des données de la requête */
        const identifiant = req.body.identifiant;
        const password = req.body.password;
        const seSouvenir = req.body.seSouvenir;

        try {
            /*Chercher si l'identifiant est un email ou pseudo existant */
            const requeteChercher = `SELECT * FROM Utilisateur WHERE (email=$1) OR (pseudo=$1)`;
            const result = await pool.query(requeteChercher, [identifiant]);

            /* Aucun email ou pseudo ne correspond*/
            if (result.rowCount === 0) {
                return res.status(400).json({ champ: 'login', message: 'Aucun email/login ne correspond' });
            } else {
                const user = result.rows[0];
                const match = await passwordModel.comparerMdp(password, user.hashmdp);

                if (match) {

                    let type = await chercherType(user.iduser);

                    /* Informations à insérer dans le token */
                    const payload = {
                        "utilisateurId": user.iduser,
                        "utilisateurType": type
                    };

                    /*  Générer le JWT */
                    let temps;
                    if (seSouvenir) {
                        temps = '30d'
                    } else {
                        temps = '24h';
                    }
                    const token = jwt.sign(payload, tokenModel.secretKey, { expiresIn: temps });

                    return res.status(200).json({ token: token, id: user.iduser, prenom: user.prenom, nom: user.nom, pseudo: user.pseudo, role: type });
                } else {
                    return res.status(400).json({ champ: 'mot de passe', message: 'Le mot de passe est incorrect' });
                }
            }
        } catch (error) {
            return res.status(400).json('Erreur lors de l\'exécution de la requête');
        }
    } else {
        return res.status(404).json('Page not found');
    }
}

module.exports = { connexion }