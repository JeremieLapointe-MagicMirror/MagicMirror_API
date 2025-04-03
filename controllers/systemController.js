const { Mirror, UserMirror } = require("../models");

// Obtenir les informations système d'un miroir
exports.getMirrorInfo = async function (req, res) {
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

    const systemInfo = {
      mirrorId: mirror.idMirror,
      name: mirror.name,
      ipAddress: mirror.ipAddress,
      lastSeen: mirror.lastUpdate,
    };

    return res.status(200).json({ system: systemInfo });
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des informations système:",
      err
    );
    return res.status(500).json({
      message:
        "Erreur serveur lors de la récupération des informations système",
      details: err.message,
    });
  }
};
