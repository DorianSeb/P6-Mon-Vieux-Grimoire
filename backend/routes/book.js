const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');  //  Import du middleware d'authentification
const multer = require('../middleware/multer-config');
const bookCtrl = require('../controllers/book');
router.post('/:id/rating', auth, bookCtrl.rateBook); // Seul un utilisateur connecté peut ajouter une note

// Routes sécurisées (on insère Multer uniquement sur les route squi acceptent les images)
router.post('/', auth, multer, bookCtrl.createBook); // Seul un utilisateur connecté peut créer un livre
router.put('/:id', auth, multer, bookCtrl.modifyBook); // Seul l’auteur du livre peut le modifier
router.delete('/:id', auth, bookCtrl.deleteBook); // Seul l’auteur du livre peut le supprimer

// Routes accessibles à tous
router.get('/', bookCtrl.getAllBooks); // Voir tous les livres (pas besoin d'être connecté)
router.get('/:id', bookCtrl.getOneBook); // Voir un livre en détail (pas besoin d'être connecté)

module.exports = router;