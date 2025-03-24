const Book = require('../models/book');
const fs = require('fs'); // ✅ File System, permet de supprimer l'image

// Récupérer tous les livres
exports.getAllBooks = (req, res) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// Récupérer un livre par son ID
exports.getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

// Ajouter un livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book); // transforme le string JSON en objet
  delete bookObject._id;
  delete bookObject.userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId, // on récupère l'id grâce au middleware d’auth
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // chemin public de l’image
  });

  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
    .catch(error => res.status(400).json({ error }));
};

// Modifier un livre
  exports.modifyBook = (req, res) => {
    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        }
      : { ...req.body };
  
    delete bookObject.userId;
  
    Book.findOne({ _id: req.params.id })
      .then(book => {
        if (book.userId !== req.auth.userId) {
          return res.status(401).json({ message: 'Non autorisé' });
        }
  
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre modifié !' }))
          .catch(error => res.status(401).json({ error }));
      })
      .catch(error => res.status(400).json({ error }));
  };

// Supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }) // On cherche le livre dans la base
    .then(book => {
      if (book.userId !== req.auth.userId) { // Vérifie si l'utilisateur est bien le créateur
        return res.status(401).json({ message: 'Non autorisé à supprimer ce livre !' });
      }

      const filename = book.imageUrl.split('/images/')[1]; // On récupère juste le nom du fichier
      fs.unlink(`images/${filename}`, () => { // On supprime le fichier image du dossier "images"
        Book.deleteOne({ _id: req.params.id }) // Ensuite on supprime le livre de la base
          .then(() => res.status(200).json({ message: 'Livre supprimé avec succès !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};