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
  // 🔄 On transforme la chaîne JSON envoyée par le front en objet JS
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;       // ❌ On supprime l’_id (on ne veut pas qu’il vienne du client)
  delete bookObject.userId;    // ❌ On ignore le userId transmis (sécurité)

  const originalFilename = req.file.filename;         // nom de l’image originale
  const outputFilename = `optimized_${originalFilename.split('.')[0]}.webp`; // nom de l’image optimisée
  const outputPath = `images/${outputFilename}`;      // chemin vers l’image optimisée

  try {
    // 🔧 Traitement de l’image avec Sharp
    await sharp(req.file.path)                 // le fichier temporaire qui vient d’être uploadé
      .resize({ width: 600 })                  // ↔️ redimensionne à 600px de large
      .webp({ quality: 80 })                   // 📦 compresse à 80% de qualité
      .toFile(outputPath);                     // 💾 enregistre dans le dossier /images

    // 🗑️ Supprime l’image d’origine (non optimisée)
    fs.unlinkSync(req.file.path);

    // 📘 Création du livre avec image optimisée
    const book = new Book({
      ...bookObject,                             // ✨ Toutes les données du formulaire
      userId: req.auth.userId,                   // ✅ Ajout de l'userId depuis le token
      imageUrl: `${req.protocol}://${req.get('host')}/images/${outputFilename}` // 🔗 URL complète vers l’image
    });

    await book.save(); // 💾 Sauvegarde en base de données
    res.status(201).json({ message: 'Livre enregistré avec image optimisée !' });
  } catch (error) {
    res.status(500).json({ error }); // ❌ Gestion des erreurs
  }
};

// Modifier un livre
  // Modifier un livre
exports.modifyBook = async (req, res) => {
  let bookObject;

  try {
    if (req.file) {
      // 📦 Si une nouvelle image est envoyée, on l’optimise avec Sharp
      const originalFilename = req.file.filename;
      const outputFilename = `optimized_${Date.now()}_${originalFilename.split('.')[0]}.webp`;
      const outputPath = `images/${outputFilename}`;

      await sharp(req.file.path)
        .resize({ width: 600 })
        .webp({ quality: 80 })
        .toFile(outputPath);

      // 🗑️ On supprime l’image d’origine non optimisée
      fs.unlinkSync(req.file.path);

      // 🔍 On récupère le livre pour supprimer l’ancienne image
      const existingBook = await Book.findOne({ _id: req.params.id });
      if (existingBook && existingBook.imageUrl) {
        const oldFilename = existingBook.imageUrl.split('/images/')[1];
        fs.unlink(`images/${oldFilename}`, () => {});
      }

      // 📦 On crée l’objet livre avec nouvelle image optimisée
      bookObject = {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${outputFilename}`
      };
    } else {
      // 🎯 Aucune image changée
      bookObject = { ...req.body };
    }

    // 🔐 On supprime le userId envoyé par le front
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