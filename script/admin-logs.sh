#!/bin/bash

# Nom de l'application PM2 
PM2_APP_NAME="main.js"

restart_pm2_app() {
  echo "15 derniers logs:"
  pm2 logs "$PM2_APP_NAME --lines 100"
  echo "Application PM2 redémarrée."
}

# Appel de la fonction
restart_pm2_app
