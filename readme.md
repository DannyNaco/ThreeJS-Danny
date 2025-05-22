# 🎮 Danny Dribble Game – Frontend Three.js

Ce projet est la partie **frontend** du jeu *Danny Dribble*, développé en **Three.js** (WebGL) et connecté à une API backend (Symfony) ainsi qu’un microservice mailer.  
Il permet à un utilisateur de jouer, de s’authentifier, de visualiser ses statistiques, le leaderboard et de sauvegarder ses scores.

---

## 🚀 Technologies utilisées

- [Three.js](https://threejs.org/) – rendu 3D WebGL
- [Vite.js](https://vitejs.dev/) – bundler rapide
- [HTML/CSS/JS](https://developer.mozilla.org/fr/)
- API externe : Symfony (auth, jeu, leaderboard)
- Microservice mailer via Nodemailer

---

## 📦 Installation

```bash
# Cloner le projet
git clone https://github.com/DannyNaco/ThreeJS-Danny.git

```

# Installer les dépendances

```bash
npm install
```

---

## ▶️ Lancer le projet en local

```bash

npm run dev

```
---

Ensuite, ouvre http://localhost:5173 dans ton navigateur.

## ⚙️ Configuration

Dans apiClient.js, tu dois définir l’URL de ton API :

```bash
export const API_BASE_URL = "http://localhost:8000/api";
```

Tu peux aussi définir les endpoints du microservice mailer dans le backend Symfony.

## ✅ Fonctionnalités

- 🧑 Connexion / Inscription avec token JWT

- 🔒 Stockage du token en localStorage

- 🎮 Déplacement 3D avec collisions, vague d’ennemis et boost

- 📊 Statistiques personnelles

- 🏆 Leaderboard global (top scores)

- 📧 Envoi d’un email à l’inscription (via microservice mailer)

## 🧪 Paramètres personnalisables

À l’accueil, tu peux régler :

- Vitesse du joueur
- Vitesse des ennemis
- Nombre d’ennemis de départ


## 📁 Structure simplifiée

```bash
.
├── index.html
├── main.js
├── apiClient.js
├── style.css
├── /node_modules
├── vite.config.js
└── README.md
```

## 🛠️ À venir
- Animations personnalisées

- Intégration d’effets sonores avancés

- Système de skins ou niveaux

## 👨‍💻 Auteur
Projet développé par Danny — 2025.
