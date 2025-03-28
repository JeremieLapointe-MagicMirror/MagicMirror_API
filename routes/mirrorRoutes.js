const express = require("express");
const router = express.Router();
const { verifyTokenUser } = require("../middleware/auth");
const mirrorController = require("../controllers/mirrorController");

// Obtenir tous les miroirs
router.get("/", verifyTokenUser, mirrorController.getMirrors);

// Obtenir un miroir spécifique
router.get("/:id", verifyTokenUser, mirrorController.getMirror);

// Créer un nouveau miroir
router.post("/", verifyTokenUser, mirrorController.createMirror);

// Mettre à jour un miroir
router.put("/:id", verifyTokenUser, mirrorController.updateMirror);

// Mettre à jour le statut d'un miroir
router.patch(
  "/:id/status",
  verifyTokenUser,
  mirrorController.updateMirrorStatus
);

// Supprimer un miroir
router.delete("/:id", verifyTokenUser, mirrorController.deleteMirror);

module.exports = router;
