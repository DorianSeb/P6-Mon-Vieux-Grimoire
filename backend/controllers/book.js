const Book = require('../models/book');
const sharp = require('sharp'); //  Permet de redimensionner les images
const fs = require('fs'); //  File System, permet de supprimer l'image du serveur

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
exports.createBook = async (req, res, next) => {
  // On transforme la chaîne JSON envoyée par le front en objet JS
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;       // On supprime l’_id (on ne veut pas qu’il vienne du client)
  delete bookObject.userId;    // On ignore le userId transmis (sécurité)

  const originalFilename = req.file.filename;         // nom de l’image originale
  const outputFilename = `optimized_${Date.now()}_${originalFilename.split('.')[0]}.webp`;// nom de l’image optimisée
  const outputPath = `images/${outputFilename}`;      // chemin vers l’image optimisée

  try {
    // Traitement de l’image avec Sharp
    await sharp(req.file.path)
      .resize({ width: 600 })                  
      .webp({ quality: 80 })                  
      .toFile(outputPath); // enregistre dans le dossier /images

    // Supprime l’image d’origine (non optimisée)
    fs.unlinkSync(req.file.path);

    // Création du livre avec image optimisée
    const book = new Book({
      ...bookObject,                             // Toutes les données du formulaire
      userId: req.auth.userId,                   
      imageUrl: `${req.protocol}://${req.get('host')}/images/${outputFilename}` // URL complète vers l’image
    });

    await book.save(); // Sauvegarde en base de données
    res.status(201).json({ message: 'Livre enregistré avec image optimisée !' });
  } catch (error) {
    res.status(500).json({ error }); // Gestion des erreurs
  }
};

// Modifier un livre
  // Modifier un livre
exports.modifyBook = async (req, res) => {
  let bookObject;

  try {
    if (req.file) {
      // Si une nouvelle image est envoyée, on l’optimise avec Sharp
      const originalFilename = req.file.filename;
      const outputFilename = `optimized_${Date.now()}_${originalFilename.split('.')[0]}.webp`;
      const outputPath = `images/${outputFilename}`;

      await sharp(req.file.path)
        .resize({ width: 600 })
        .webp({ quality: 80 })
        .toFile(outputPath);

      // On supprime l’image d’origine non optimisée
      fs.unlinkSync(req.file.path);

      // On récupère le livre pour supprimer l’ancienne image
      const existingBook = await Book.findOne({ _id: req.params.id });
      if (existingBook && existingBook.imageUrl) {
        const oldFilename = existingBook.imageUrl.split('/images/')[1];
        fs.unlink(`images/${oldFilename}`, () => {});
      }

      // On crée l’objet livre avec nouvelle image optimisée
      bookObject = {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${outputFilename}`
      };
    } else {
      // Aucune image changée
      bookObject = { ...req.body };
    }

    // On supprime le userId envoyé par le front
    delete bookObject.userId;

    const book = await Book.findOne({ _id: req.params.id });

    if (book.userId !== req.auth.userId) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
    res.status(200).json({ message: 'Livre modifié avec image optimisée !' });
  } catch (error) {
    res.status(400).json({ error });
  }
};

// Supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }) 
    .then(book => {
      if (book.userId !== req.auth.userId) { 
        return res.status(401).json({ message: 'Non autorisé à supprimer ce livre !' });
      }
      // On supprime l’image du livre
      // On récupère le nom du fichier à partir de l’URL
      // On utilise split pour séparer l’URL et récupérer juste le nom du fichier
      // On utilise le module fs pour supprimer le fichier
      const filename = book.imageUrl.split('/images/')[1]; 
      fs.unlink(`images/${filename}`, () => { 
        Book.deleteOne({ _id: req.params.id }) 
          .then(() => res.status(200).json({ message: 'Livre supprimé avec succès !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
  }

    // Contrôleur pour ajouter une notation à un livre
exports.rateBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    // On récupère l'userId et la note (rating) envoyés par le client dans le body de la requête
    const { userId, rating } = req.body;
    if (rating < 0 || rating > 5) {
      return res.status(400).json({ message: "La note doit être entre 0 et 5." });
    }

    // On cherche le livre dans la base de données avec son ID
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé." });
    }
    // On vérifie si l’utilisateur a déjà noté ce livre
    const alreadyRated = book.ratings.find(rating => rating.userId === userId);
    if (alreadyRated) {
      return res.status(400).json({ message: "Vous avez déjà noté ce livre." });
    }
    // Si tout est ok, on ajoute la nouvelle note dans le tableau ratings
    book.ratings.push({ userId, grade: rating });

    // On recalcule la note moyenne à partir de toutes les notes
    const total = book.ratings.reduce((sum, r) => sum + r.grade, 0);
    book.averageRating = total / book.ratings.length;

    await book.save();
    res.status(200).json(book);

  } catch (error) {
    res.status(500).json({ error });
  }
};
// Récupérer les 3 livres ayant la meilleure note moyenne
exports.getBestRatedBooks = async (req, res) => {
  try {
    const bestBooks = await Book.find().sort({ averageRating: -1 }).limit(3);
    res.status(200).json(bestBooks);
  } catch (error) {
    res.status(500).json({ error });
  }
};