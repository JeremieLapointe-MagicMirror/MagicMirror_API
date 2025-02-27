const express = require("express");
const router = express.Router();
const { verifyTokenUser } = require("../middleware/auth");
const userController = require("../controllers/userController");

/**
 * Route d'inscription
 * POST /api/users/register
 * Crée un nouvel utilisateur
 */
router.post("/register", userController.register);

/**
 * Route de connexion
 * POST /api/users/login
 * Authentifie un utilisateur et génère un token JWT
 */
router.post("/login", userController.login);

/**
 * Route pour obtenir l'utilisateur actuel
 * GET /api/users/me
 * Nécessite un token d'authentification
 */
router.get("/me", verifyTokenUser, userController.getCurrentUser);

module.exports = router;
