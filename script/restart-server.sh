#!/bin/bash

# Nom de l'application PM2 
PM2_APP_NAME="bin/www"

restart_pm2_app() {
  echo "Redémarrage de l'application PM2..."
  pm2 restart "$PM2_APP_NAME"
  echo "Application PM2 redémarrée."
}

# Appel de la fonction
restart_pm2_app
