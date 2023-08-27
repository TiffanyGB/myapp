const pool = require("./configDB");
const cron = require('node-cron');
const jwt = require('jsonwebtoken');
const secretKey = 'votre-clé-secrète';


// Tâche planifiée pour nettoyer les tokens expirés toutes les heures
cron.schedule('0 * * * *', async () => {
    const currentTimestamp = Math.floor(Date.now() / 1000);

    try {
        // Sélectionnez tous les tokens de la base de données
        const selectQuery = 'SELECT * FROM jwt';
        const result = await pool.query(selectQuery);

        console.log(result)
    //     // Parcourez les tokens et vérifiez leur validité
    //     result.rows.forEach(async (row) => {
    //         const token = row.token;
    //         try {
    //             const decoded = jwt.verify(token, secretKey);
    //             if (decoded.exp < currentTimestamp) {
    //                 // Supprimez le token expiré de la base de données
    //                 const deleteQuery = 'DELETE FROM tokens WHERE token = $1';
    //                 await client.query(deleteQuery, [token]);
    //                 console.log(`Token expiré supprimé : ${token}`);
    //             }
    //         } catch (err) {
    //             // Le token n'est pas valide, ignorez-le
    //         }
    //     });
    } catch (err) {
        console.error('Erreur lors de la récupération des tokens :', err);
    }
});

// Gardez le script en cours d'exécution
process.stdin.resume();