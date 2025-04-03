const express = require('express');
const mongoose = require('mongoose');

const userRoutes = require('./routes/user'); // Routes d'authentification
const bookRoutes = require('./routes/book'); // Ajout du routeur pour les livres
const path = require('path'); // Importation du module path de Node.js
require('dotenv').config(); 

const app = express();

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(err => console.log('Connexion à MongoDB échouée !', err));

app.use(express.json());

// Middleware CORS pour autoriser le front-end à accéder à l'API
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Enregistrement des routes sous /api/auth et /api/books
app.use('/images', express.static(path.join(__dirname, 'images'))); // Sert les fichiers statiques depuis le dossier "images"
app.use('/api/auth', userRoutes); 
app.use('/api/books', bookRoutes); 

// Exportation de l'application
module.exports = app;