# Lancement du serveur Node.JS
Il faut exécuter la ligne de commande: 
`./start-server.sh`

Cette commande ne peux pas être exécutée si le serveur est déjà lancé.
Il y aura une erreur. Il faut arrêter le serveur.

# Redémarrer le serveur Node.JS
Commande: `./restart-server.sh`

Contrairement à la commande de 'start', elle peut être exécutée même si le serveur n'est pas arrêté.

Il peut également avoir une erreur si le serveur n'est pas démarré.

# Arrêter le serveur Node.JS
Commande: `./stop-server.sh`

Il faut que le serveur soit démarré en hammont, sinon erreur.


# Réinitialiser la base de données PostgreSQL et redémarrage du serveur Node.JS
Exécuter la commande: `./restart-tout.sh`

La base de données sera remise à 0.
Un administrateur par défaut sera inséré dans la base de données avec un mot de passe haché.




