const express = require("express");
const router = express.Router({ mergeParams: true });
const { verifyTokenUser } = require("../middleware/auth");
const systemController = require("../controllers/systemController");

// Obtenir les informations système d'un miroir
router.get("/info", verifyTokenUser, systemController.getMirrorInfo);

module.exports = router;
