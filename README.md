# WoW Farador App

Application Angular + Node.js pour la réservation de loots de raids de la guilde Farador sur World of Warcraft.

## Fonctionnalités
- Authentification sans inscription (users MongoDB)
- Liste des raids & réservation par classe
- Interface responsive avec PrimeNG
- Import automatique des loots depuis l’API Blizzard

## Démarrage local
```bash
npm install
npm run start:server
npm run import
cd farador-farador-frontend
npm install
npm start
```

## Déploiement
Prévu pour Railway / Vercel / Render avec variables `.env` sécurisées
