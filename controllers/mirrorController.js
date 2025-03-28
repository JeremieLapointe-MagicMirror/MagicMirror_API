const validator = require("validator");
const sequelize = require("../config/database");
const { Mirror, User, UserMirror } = require("../models");

function sanitizeField(field) {
  return validator.escape(field);
}

// Obtenir tous les miroirs de l'utilisateur courant
exports.getMirrors = async function (req, res) {
  try {
    const userId = req.user.id;

    // Récupérer les miroirs associés à l'utilisateur
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Mirror,
          through: { attributes: [] }, // Ne pas inclure les attributs de la table de jointure
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.status(200).json({ mirrors: user.Mirrors });
  } catch (err) {
    console.error("Erreur lors de la récupération des miroirs:", err);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des miroirs",
      details: err.message,
    });
  }
};

// Obtenir un miroir spécifique
exports.getMirror = async function (req, res) {
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

    const mirror = await Mirror.findByPk(mirrorId);

    if (!mirror) {
      return res.status(404).json({ message: "Miroir non trouvé" });
    }

    return res.status(200).json({ mirror });
  } catch (err) {
    console.error("Erreur lors de la récupération du miroir:", err);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération du miroir",
      details: err.message,
    });
  }
};

// Créer un nouveau miroir
exports.createMirror = async function (req, res) {
  try {
    const { name, config, ipAddress } = req.body;
    const userId = req.user.id;

    // Nettoyage des champs pour éviter les injections
    let tempName = name ? sanitizeField(name) : null;
    let tempIpAddress = ipAddress ? sanitizeField(ipAddress) : null;

    if (
      (name && name !== tempName) ||
      (ipAddress && ipAddress !== tempIpAddress)
    ) {
      return res.status(400).send({
        message: "Champs invalides. Veuillez vérifier les caractères spéciaux.",
      });
    }

    // Vérifier les champs requis
    if (!name) {
      return res.status(400).json({ message: "Le nom du miroir est requis" });
    }

    // Créer le miroir - sans le champ active ni status
    const mirror = await Mirror.create({
      name: tempName,
      config: config || null,
      ipAddress: tempIpAddress,
      lastUpdate: new Date(),
    });

    // Associer le miroir à l'utilisateur
    await UserMirror.create({
      userId: userId,
      mirrorId: mirror.idMirror,
    });

    return res.status(201).json({
      message: "Miroir créé avec succès",
      mirror,
    });
  } catch (err) {
    console.error("Erreur lors de la création du miroir:", err);
    return res.status(500).json({
      message: "Erreur serveur lors de la création du miroir",
      details: err.message,
    });
  }
};

// Mettre à jour la configuration d'un miroir
exports.updateMirror = async function (req, res) {
  try {
    const mirrorId = req.params.id;
    const userId = req.user.id;
    const { name, config, ipAddress } = req.body;

    // Nettoyage des champs
    let tempName = name ? sanitizeField(name) : undefined;
    let tempIpAddress = ipAddress ? sanitizeField(ipAddress) : undefined;

    if (
      (name && name !== tempName) ||
      (ipAddress && ipAddress !== tempIpAddress)
    ) {
      return res.status(400).send({
        message: "Champs invalides. Veuillez vérifier les caractères spéciaux.",
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

    // Mettre à jour les champs fournis
    const updateData = {};
    if (tempName !== undefined) updateData.name = tempName;
    if (config !== undefined) updateData.config = config;
    if (tempIpAddress !== undefined) updateData.ipAddress = tempIpAddress;

    updateData.lastUpdate = new Date();

    // Mettre à jour le miroir
    await Mirror.update(updateData, {
      where: { idMirror: mirrorId },
    });

    // Récupérer les données mises à jour
    const updatedMirror = await Mirror.findByPk(mirrorId);

    return res.status(200).json({
      message: "Miroir mis à jour avec succès",
      mirror: updatedMirror,
    });
  } catch (err) {
    console.error("Erreur lors de la mise à jour du miroir:", err);
    return res.status(500).json({
      message: "Erreur serveur lors de la mise à jour du miroir",
      details: err.message,
    });
  }
};

// Mise à jour du statut d'un miroir - utiliser config au lieu de status
exports.updateMirrorStatus = async function (req, res) {
  try {
    const mirrorId = req.params.id;
    const userId = req.user.id;
    const { status } = req.body;

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

    // Au lieu d'utiliser une colonne 'status', stocker l'état dans la configuration JSON
    let config = {};
    try {
      config = mirror.config ? JSON.parse(mirror.config) : {};
    } catch (error) {
      config = {};
    }

    config.status = status;

    // Mettre à jour le miroir
    await Mirror.update(
      {
        config: JSON.stringify(config),
        lastUpdate: new Date(),
      },
      { where: { idMirror: mirrorId } }
    );

    return res.status(200).json({
      message: "Statut du miroir mis à jour avec succès",
      status: status,
    });
  } catch (err) {
    console.error("Erreur lors de la mise à jour du statut:", err);
    return res.status(500).json({
      message: "Erreur serveur lors de la mise à jour du statut",
      details: err.message,
    });
  }
};

// Supprimer un miroir
exports.deleteMirror = async function (req, res) {
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

    // Vérifier si c'est le seul utilisateur avec accès au miroir
    const userCount = await UserMirror.count({
      where: { mirrorId: mirrorId },
    });

    // Supprimer l'association utilisateur-miroir
    await UserMirror.destroy({
      where: {
        userId: userId,
        mirrorId: mirrorId,
      },
    });

    // Si c'est le seul utilisateur, supprimer également le miroir
    if (userCount === 1) {
      await Mirror.destroy({
        where: { idMirror: mirrorId },
      });
      return res.status(200).json({ message: "Miroir supprimé avec succès" });
    }

    return res
      .status(200)
      .json({ message: "Votre accès au miroir a été supprimé" });
  } catch (err) {
    console.error("Erreur lors de la suppression du miroir:", err);
    return res.status(500).json({
      message: "Erreur serveur lors de la suppression du miroir",
      details: err.message,
    });
  }
};
