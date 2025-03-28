const express = require("express");
const router = express.Router({ mergeParams: true });
const { verifyTokenUser } = require("../middleware/auth");
const systemController = require("../controllers/systemController");

// Obtenir le statut d'un miroir
router.get("/status", verifyTokenUser, systemController.getMirrorStatus);

module.exports = router;
