const multer = require('multer'); 

// Définition des extensions possibles pour les images
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};
// multer.diskStorage() permet de configurer le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images'); 
  },

  // Nom du fichier enregistré
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_'); // Remplace les espaces par des underscores (_)
    const extension = MIME_TYPES[file.mimetype]; // extension correcte (jpg, png, etc.)
    callback(null, name + Date.now() + '.' + extension); // Ajoute un timestamp pour un nom unique
  }
});

// Export du middleware : on autorise uniquement un fichier image par requête
module.exports = multer({ storage: storage }).single('image');