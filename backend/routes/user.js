const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user'); // contrôleur d'authentification

router.post('/signup', userCtrl.signup); // Route pour l'inscription

module.exports = router;