const validator = require("validator");
const sequelize = require("../config/database");
const { Mirror, User, UserMirror } = require("../models");

function sanitizeField(field) {
  return validator.escape(field);
}

exports.getMirrors = async function (req, res) {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.type === "admin";

    let mirrors;

    if (isAdmin) {
      // Pour les admins: tous les miroirs
      mirrors = await Mirror.findAll({
        order: [["name", "ASC"]],
      });
    } else {
      // Pour les utilisateurs normaux: seulement leurs miroirs
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Mirror,
            through: UserMirror,
          },
        ],
      });

      mirrors = user ? user.Mirrors : [];
    }

    // Formater les données pour correspondre au modèle Android
    const formattedMirrors = mirrors.map((mirror) => ({
      id: mirror.idMirror,
      name: mirror.name,
      isActive:
        mirror.lastUpdate &&
        new Date(mirror.lastUpdate) >
          new Date(Date.now() - 24 * 60 * 60 * 1000),
      lastSeen: mirror.lastUpdate
        ? new Date(mirror.lastUpdate).toLocaleString()
        : "Jamais",
      ipAddress: mirror.ipAddress || "Non disponible",
      widgets: mirror.config ? JSON.parse(mirror.config).widgets || [] : [],
    }));

    return res.status(200).json(formattedMirrors);
  } catch (err) {
    console.error("Erreur lors de la récupération des miroirs:", err);
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: err.message });
  }
};

exports.getMirrorById = async function (req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.type === "admin";

    // Vérifier l'existence du miroir
    const mirror = await Mirror.findByPk(id);

    if (!mirror) {
      return res.status(404).json({ message: "Miroir non trouvé" });
    }

    // Si l'utilisateur n'est pas admin, vérifier qu'il a accès à ce miroir
    if (!isAdmin) {
      const hasAccess = await UserMirror.findOne({
        where: {
          userId: userId,
          mirrorId: id,
        },
      });

      if (!hasAccess) {
        return res.status(403).json({ message: "Accès refusé à ce miroir" });
      }
    }

    // Formater la réponse
    const formattedMirror = {
      id: mirror.idMirror,
      name: mirror.name,
      isActive:
        mirror.lastUpdate &&
        new Date(mirror.lastUpdate) >
          new Date(Date.now() - 24 * 60 * 60 * 1000),
      lastSeen: mirror.lastUpdate
        ? new Date(mirror.lastUpdate).toLocaleString()
        : "Jamais",
      ipAddress: mirror.ipAddress || "Non disponible",
      widgets: mirror.config ? JSON.parse(mirror.config).widgets || [] : [],
    };

    return res.status(200).json(formattedMirror);
  } catch (err) {
    console.error("Erreur lors de la récupération du miroir:", err);
    return res.status(500).json({ message: "Erreur serveur" });
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

    // Créer le miroir
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
