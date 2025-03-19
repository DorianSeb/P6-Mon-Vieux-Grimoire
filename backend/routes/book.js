const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');  //  Import du middleware d'authentification
const bookCtrl = require('../controllers/book');

// Routes sécurisées
router.post('/', auth, bookCtrl.createBook); // Seul un utilisateur connecté peut créer un livre
router.put('/:id', auth, bookCtrl.modifyBook); // Seul l’auteur du livre peut le modifier
router.delete('/:id', auth, bookCtrl.deleteBook); // Seul l’auteur du livre peut le supprimer

// Routes accessibles à tous
router.get('/', bookCtrl.getAllBooks); // Voir tous les livres (pas besoin d'être connecté)
router.get('/:id', bookCtrl.getOneBook); // Voir un livre en détail (pas besoin d'être connecté)

module.exports = router;