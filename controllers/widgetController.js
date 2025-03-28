const validator = require("validator");
const { Mirror, UserMirror } = require("../models");

function sanitizeField(field) {
  return validator.escape(field);
}

// Obtenir tous les widgets d'un miroir
exports.getWidgets = async function (req, res) {
  try {
    const mirrorId = req.params.id;
    const userId = req.user.id;

    // Vérifier si l'utilisateur a accès au miroir
    const userMirror = await UserMirror.findOne({
      where: {
        userId: userId,
        mirrorId: mirrorId,
      },
    });

    if (!userMirror) {
      return res
        .status(403)
        .json({ message: "Accès non autorisé à ce miroir" });
    }

    // Récupérer le miroir
    const mirror = await Mirror.findByPk(mirrorId);

    if (!mirror) {
      return res.status(404).json({ message: "Miroir non trouvé" });
    }

    // Extraire les widgets du champ config
    let config = {};
    try {
      config = mirror.config ? JSON.parse(mirror.config) : {};
    } catch (error) {
      console.error("Erreur lors du parsing de la configuration:", error);
      config = {};
    }

    const widgets = config.widgets || [];

    return res.status(200).json({ widgets });
  } catch (err) {
    console.error("Erreur lors de la récupération des widgets:", err);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des widgets",
      details: err.message,
    });
  }
};

// ... le reste du code reste inchangé
