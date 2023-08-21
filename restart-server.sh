#!/bin/bash

# Nom de l'application PM2 (doit correspondre au nom que vous avez donné à l'application)
PM2_APP_NAME="bin/www"

# Fonction pour redémarrer l'application PM2
restart_pm2_app() {
  echo "Redémarrage de l'application PM2..."
  pm2 restart "$PM2_APP_NAME"
  echo "Application PM2 redémarrée."
}

# Appel de la fonction de redémarrage
restart_pm2_app
