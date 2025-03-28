const express = require("express");
const router = express.Router({ mergeParams: true });
const { verifyTokenUser } = require("../middleware/auth");
const permissionController = require("../controllers/permissionController");

// Obtenir tous les utilisateurs ayant accès à un miroir
router.get("/", verifyTokenUser, permissionController.getMirrorUsers);

// Ajouter un utilisateur à un miroir
router.post("/", verifyTokenUser, permissionController.addUserToMirror);

// Supprimer un utilisateur d'un miroir
router.delete(
  "/:userId",
  verifyTokenUser,
  permissionController.removeUserFromMirror
);

// Modifier le rôle d'un utilisateur
router.patch(
  "/:userId/role",
  verifyTokenUser,
  permissionController.updateUserRole
);

module.exports = router;
