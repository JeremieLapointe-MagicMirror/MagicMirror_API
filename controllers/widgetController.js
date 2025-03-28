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

// Basculer l'état (actif/inactif) d'un widget
exports.toggleWidget = async function (req, res) {
  try {
    const mirrorId = req.params.id;
    const widgetName = req.params.name;
    const userId = req.user.id;

    // Nettoyage du nom de widget
    const tempWidgetName = sanitizeField(widgetName);
    if (widgetName !== tempWidgetName) {
      return res.status(400).send({
        message:
          "Nom de widget invalide. Veuillez vérifier les caractères spéciaux.",
      });
    }

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

    // Extraire la configuration
    let config = {};
    try {
      config = mirror.config ? JSON.parse(mirror.config) : {};
    } catch (error) {
      console.error("Erreur lors du parsing de la configuration:", error);
      config = {};
    }

    // S'assurer que la liste des widgets existe
    if (!config.widgets) {
      config.widgets = [];
    }

    // Trouver le widget par son nom
    const widgetIndex = config.widgets.findIndex((w) => w.name === widgetName);

    if (widgetIndex === -1) {
      return res.status(404).json({ message: "Widget non trouvé" });
    }

    // Basculer l'état du widget
    config.widgets[widgetIndex].enabled = !config.widgets[widgetIndex].enabled;

    // Mettre à jour la configuration
    await Mirror.update(
      {
        config: JSON.stringify(config),
        lastUpdate: new Date(),
      },
      { where: { idMirror: mirrorId } }
    );

    return res.status(200).json({
      message: "État du widget modifié avec succès",
      widget: config.widgets[widgetIndex],
    });
  } catch (err) {
    console.error("Erreur lors de la modification de l'état du widget:", err);
    return res.status(500).json({
      message: "Erreur serveur lors de la modification de l'état du widget",
      details: err.message,
    });
  }
};
