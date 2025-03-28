const express = require("express");
const router = express.Router({ mergeParams: true });
const { verifyTokenUser } = require("../middleware/auth");
const widgetController = require("../controllers/widgetController");

// Obtenir tous les widgets d'un miroir
router.get("/", verifyTokenUser, widgetController.getWidgets);

// Basculer l'état d'un widget (actif/inactif)
router.patch("/:name/toggle", verifyTokenUser, widgetController.toggleWidget);

module.exports = router;
