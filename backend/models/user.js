const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Empêche les emails en double
  password: { type: String, required: true } // Stockera le mot de passe hashé
});

// Applique le plugin pour éviter les emails en double
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);