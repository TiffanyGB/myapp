#!/bin/bash

#Nom de l'application
PM2_APP_NAME="main.js"

stop_pm2_app() {
  echo "Arrêt du serveur Node.js..."
  pm2 stop "$PM2_APP_NAME"
  echo "Application PM2 arrêtée."
}

# Appel de la fonction d'arrêt
stop_pm2_app
