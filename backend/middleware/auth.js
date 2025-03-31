const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Récupère le token dans le header Authorization (format : "Bearer TOKEN")
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');

        req.auth = {
            userId: decodedToken.userId
        };

        // Passe à la suite (next)
        next();
    } catch (error) {
        res.status(401).json({ error: 'Requête non authentifiée !' });
    }
};