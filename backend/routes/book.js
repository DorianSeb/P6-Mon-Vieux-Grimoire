const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');  
const multer = require('../middleware/multer-config');
const bookCtrl = require('../controllers/book');
router.post('/:id/rating', auth, bookCtrl.rateBook); 

// Routes sécurisées (on insère Multer uniquement sur les routes qui acceptent les images)
router.post('/', auth, multer, bookCtrl.createBook); 
router.put('/:id', auth, multer, bookCtrl.modifyBook); 
router.delete('/:id', auth, bookCtrl.deleteBook); 

// Routes accessibles à tous
router.get('/', bookCtrl.getAllBooks); // Voir tous les livres (pas besoin d'être connecté)
router.get('/bestrating', bookCtrl.getBestRatedBooks);
router.get('/:id', bookCtrl.getOneBook); // Voir un livre en détail (pas besoin d'être connecté)

module.exports = router;