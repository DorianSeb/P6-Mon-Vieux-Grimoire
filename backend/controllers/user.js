const bcrypt = require('bcrypt');
const User = require('../models/user');

exports.signup = (req, res) => {
  bcrypt.hash(req.body.password, 10) // Hashage du mot de passe avec un "sel" de 10 tours
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash // Stockage du mot de passe haché
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};