#!/bin/bash

# Exécution des scripts shell
echo "Exécution du premier script..."
./restart-server.sh

./bdd.sh

node ./database/hachage_admin.js
node ./database/etudiant.js

