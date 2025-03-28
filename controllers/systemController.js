const { Mirror, UserMirror } = require("../models");

// Obtenir le statut d'un miroir - en utilisant la configuration JSON
exports.getMirrorStatus = async function (req, res) {
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

    // Extraire le statut de la configuration JSON
    let config = {};
    try {
      config = mirror.config ? JSON.parse(mirror.config) : {};
    } catch (error) {
      console.error("Erreur lors du parsing de la configuration:", error);
      config = {};
    }

    const status = {
      online: config.status?.online || false,
      status: config.status || "offline",
      lastSeen: mirror.lastUpdate,
      ipAddress: mirror.ipAddress,
      version: config.version || "inconnue",
    };

    return res.status(200).json({ status });
  } catch (err) {
    console.error("Erreur lors de la récupération du statut:", err);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération du statut",
      details: err.message,
    });
  }
};
