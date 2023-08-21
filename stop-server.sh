#!/bin/bash

# Définir le port sur lequel votre serveur Node.js écoute
PORT=3000
PM2_APP_NAME="bin/www"

# Fonction pour arrêter le serveur
stop_pm2_app() {
  echo "Arrêt du serveur Node.js..."
  pm2 stop "$PM2_APP_NAME"
  echo "Application PM2 arrêtée."
}

# Appel de la fonction d'arrêt
stop_pm2_app
