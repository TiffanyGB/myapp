#!/bin/bash

# Nom de l'application PM2 
PM2_APP_NAME="main.js"

restart_pm2_app() {
  echo "Démarrage de l'application PM2..."
  pm2 start "$PM2_APP_NAME"
  echo "Application PM2 démarrée."
}

# Appel de la fonction
restart_pm2_app
