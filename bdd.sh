#!/bin/bash

# Configurations de la base de données
DB_USER="test44"
DB_NAME="postgres"
DB_PORT=5432 # Port par défaut pour PostgreSQL


# Fonction pour afficher et gérer les erreurs
handle_error() {
    echo "Une erreur s'est produite : $1"
    exit 1
}

# Exécuter le script SQL
psql -h localhost -U $DB_USER -d $DB_NAME -f /home/cytech/Stage/test_node_express/myapp/database/users.sql

# Vérifier le code de sortie de psql (0 indique succès, autre chose indique une erreur)
if [ $? -ne 0 ]; then
    handle_error "Erreur lors de l'exécution du script SQL"
fi

echo "Script SQL exécuté avec succès."

