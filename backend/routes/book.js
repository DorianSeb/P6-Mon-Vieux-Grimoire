const express = require('express');
const router = express.Router();
const bookCtrl = require('../controllers/book'); // On va créer ce fichier après

// Routes pour les livres
router.post('/', bookCtrl.createBook);
router.get('/', bookCtrl.getAllBooks);
router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', bookCtrl.modifyBook);
router.delete('/:id', bookCtrl.deleteBook);

module.exports = router;