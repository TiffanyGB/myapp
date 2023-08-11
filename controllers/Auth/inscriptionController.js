const userModel = require('../../models/userModel');
const etudiantModel = require('../../models/etudiantModel');

const { validationResult } = require('express-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const tokenModel = require('../../models/tokenModel');

const generateSecretKey = () => {
    return crypto.randomBytes(64).toString('hex');
};
const secretKey = generateSecretKey();


/**
 * Inscription d'un étudiant.
 * Permet à un étudiant sans compte d'en créer un.
 * 
 * @param {Object} req - L'objet requête Express.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Object} - L'objet réponse Express avec les résultats de l'inscription ou les erreurs.
 * @route POST /users/inscription
 */
async function inscriptionEleve(req, res) {
    if (req.method === 'POST') {

        /**Données du formulaire d'inscription */
        const {
            nom: userNom,
            prenom: userPrenom,
            pseudo: userPseudo,
            email: userMail,
            linkedin: userLinkedin,
            github: userGitHub,
            ville: userVille,
            ecole: userEcole,
            niveau_etude: userNiveauEtude,
            password
        } = req.body;


        /** Informations spécifique à un utilisateur */
        const values = [
            userNom,
            userPrenom,
            userPseudo,
            userMail,
            userLinkedin,
            userGitHub,
            userVille,
        ];

        /** Pour retrouver l'id de l'utilisateur inséré, pour inséré un etudiant du même id */
        const values_id = [
            userPseudo,
            userMail
        ];

        /*Vérifier les données des étudiants */
        await etudiantModel.validerEtudiant(req);

        /**Exécute la requete de validation adapté */
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            userModel.insererUser(values, password, values_id, 'etudiant')

                .then((insertion) => {
                    if (typeof insertion === 'number') {

                        etudiantModel.creerEtudiant(userEcole, userNiveauEtude, insertion)
                            .then(() => {

                                /**  Informations à insérer dans le token */
                                const payload = {
                                    "utilisateurId": insertion,
                                    "utilisateurType": 'etudiant'
                                };

                                /**  Générer le JWT */
                                const token = jwt.sign(payload, secretKey, { expiresIn: '30d' });
                                tokenModel.stockerJWT(token, secretKey);
                                return res.status(200).json({ token: token, id: insertion, prenom: userPrenom, nom: userNom, pseudo: userPseudo, role: 'etudiant' });
                            })
                            .catch(() => {
                                /**Supprimer l'utilisateur */
                                userModel.supprimerUser(insertion, 'etudiant')
                                return res.status(400).json({ erreur: "erreur", Détails: "Utilisateur supprimé de la table utilisateur" });
                            });

                    } else if (insertion === 'les2') {
                        return res.status(400).json({ error: 'L\'email et le pseudo existent déjà.' });

                    } else if (insertion === 'pseudo') {
                        return res.status(400).json({ error: 'Le pseudo existe déjà.' });

                    } else if (insertion === 'mail') {
                        return res.status(400).json({ error: 'L\'adresse mail existe déjà.' });
                    }
                });
        } catch {
            return res.status(400).json({ message: 'Erreur lors de l\'insertion de l\'utilisateur.' });
        }
    }
}

module.exports = { inscriptionEleve }