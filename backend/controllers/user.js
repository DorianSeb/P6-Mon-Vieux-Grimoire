const bcrypt = require('bcrypt'); // Importer bcrypt pour hacher les mots de passe
const jwt = require('jsonwebtoken'); // Importer jsonwebtoken pour créer des tokens
const User = require('../models/user'); // Importer le modèle User

exports.signup = (req, res, next) => {
  bcrypt.hash(req.body.password, 10) // Hashage du mot de passe avec un "sel" de 10 tours
    .then(hash => {
      const user = new User({
        email: req.body.email, // Récupérer l'email du formulaire
        password: hash // Stocker le mot de passe haché
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error })); // Gérer les erreurs
    })
    .catch(error => res.status(500).json({ error })); // Erreur serveur
};

exports.login = (req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id }, // Payload (données stockées dans le token)
                            'RANDOM_TOKEN_SECRET', // Clé secrète de chiffrement (à sécuriser dans .env plus tard)
                            { expiresIn: '24h' } // Expiration du token après 24h
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };