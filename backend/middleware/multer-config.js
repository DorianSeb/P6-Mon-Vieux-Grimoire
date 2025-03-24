const multer = require('multer'); 

// Définition des extensions possibles pour les images
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  // Destination : où enregistrer les fichiers
  destination: (req, file, callback) => {
    callback(null, 'images'); // Stocke les fichiers dans le dossier "images"
  },

  // Nom du fichier enregistré
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_'); // Remplace les espaces par des underscores (_)
    const extension = MIME_TYPES[file.mimetype]; // Trouve l’extension correcte (jpg, png, etc.)
    callback(null, name + Date.now() + '.' + extension); // Ajoute un timestamp pour un nom unique
  }
});

// Export du middleware : on autorise uniquement un fichier image par requête
module.exports = multer({ storage: storage }).single('image');