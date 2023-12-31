/** 
 * @fileoverview Contrôleur de l'inscription
 * @module Inscription
 * 
 * @version 1.0.0 
 * @author Tiffany GAY-BELLILE
 * @requires ../../models/userModel
 * @requires ../../models/etudiantModel
 * @requires ../../models/tokenModel
 * @requires ../../validateur
 * @requires jsonwebtoken
 */

const userModel = require('../../models/userModel');
const etudiantModel = require('../../models/etudiantModel');
const tokenModel = require('../../models/tokenModel');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

/**
 * Inscription d'un étudiant.
 * Permet à un étudiant sans compte d'en créer un.
 * @function
 * @param {Object} req - L'objet requête Express.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Object} - Un code 200
 * @description Cette fonction récupère les données du formulaire d'inscription renvoyées par la requête. 
 * Elle vérifie que les données soient bonnes grâce à la fonction de validation des données d'un étudiant.
 * S'il y a un problème dans ses données, elle renvoie la liste des erreurs. Sinon, elle insère l'étudiant dans
 * la base de données.
 * 
 * La route de ce controller se trouve dans routes/index.js

 */
async function inscriptionEleve(req, res) {
    if (req.method === 'POST') {

        /**Données renvoyées par la requête*/
        const {
            nom,
            prenom,
            pseudo: userPseudo,
            email: userMail,
            linkedin: userLinkedin,
            github: userGitHub,
            ville,
            ecole: userEcole,
            niveau_etude: userNiveauEtude,
            password
        } = req.body;

        /*Permet de supprimer les espaces au début et la fin */
        let userNom = nom.trim();
        let userPrenom = prenom.trim();
        let userVille = ville.trim();

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

        /*Vérifier les données des étudiants */
        await etudiantModel.validerEtudiant(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errorDetected = true;
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const insertion = await userModel.insererUser(values, password, [userPseudo, userMail])

            /*La variable 'insertion' contient l'id de l'utilisateur inséré */
            if (typeof insertion === 'number') {

                etudiantModel.creerEtudiant(userEcole, userNiveauEtude, insertion)
                    .then(() => {

                        /**  Informations à insérer dans le token */
                        const payload = {
                            "utilisateurId": insertion,
                            "utilisateurType": 'etudiant'
                        };

                        /**  Générer le JWT */
                        const token = jwt.sign(payload, tokenModel.secretKey, { expiresIn: '24h' });
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
        } catch (error) {
            return res.status(400).json({ message: 'Erreur lors de l\'insertion de l\'utilisateur.' });
        }
    } else {
        return res.status(404).json('Page not found');
    }
}

module.exports = { inscriptionEleve }