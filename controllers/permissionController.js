const validator = require("validator");
const { User, Mirror, UserMirror } = require("../models");

function sanitizeField(field) {
  return validator.escape(field);
}

// Obtenir tous les utilisateurs ayant accès à un miroir
exports.getMirrorUsers = async function (req, res) {
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

    // Récupérer les utilisateurs associés au miroir
    const mirror = await Mirror.findByPk(mirrorId, {
      include: [
        {
          model: User,
          attributes: ["idUser", "email", "firstName", "lastName", "isAdmin"],
          through: { attributes: [] }, // Ne pas inclure les attributs de la table de jointure
        },
      ],
    });

    if (!mirror) {
      return res.status(404).json({ message: "Miroir non trouvé" });
    }

    return res.status(200).json({ users: mirror.Users });
  } catch (err) {
    console.error("Erreur lors de la récupération des utilisateurs:", err);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des utilisateurs",
      details: err.message,
    });
  }
};

// Ajouter un utilisateur à un miroir
exports.addUserToMirror = async function (req, res) {
  try {
    const mirrorId = req.params.id;
    const { email } = req.body;
    const userId = req.user.id;

    // Nettoyage des champs
    const tempEmail = sanitizeField(email);
    if (email !== tempEmail) {
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

    // Vérifier si le miroir existe
    const mirror = await Mirror.findByPk(mirrorId);
    if (!mirror) {
      return res.status(404).json({ message: "Miroir non trouvé" });
    }

    // Trouver l'utilisateur à ajouter par email
    const userToAdd = await User.findOne({
      where: { email: email.toLowerCase() },
    });
    if (!userToAdd) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si l'utilisateur est déjà associé au miroir
    const existingUserMirror = await UserMirror.findOne({
      where: {
        userId: userToAdd.idUser,
        mirrorId: mirrorId,
      },
    });

    if (existingUserMirror) {
      return res
        .status(409)
        .json({ message: "L'utilisateur a déjà accès à ce miroir" });
    }

    // Ajouter l'utilisateur au miroir
    await UserMirror.create({
      userId: userToAdd.idUser,
      mirrorId: mirrorId,
    });

    return res.status(201).json({
      message: "Utilisateur ajouté au miroir avec succès",
      user: {
        id: userToAdd.idUser,
        email: userToAdd.email,
        firstName: userToAdd.firstName,
        lastName: userToAdd.lastName,
      },
    });
  } catch (err) {
    console.error("Erreur lors de l'ajout de l'utilisateur au miroir:", err);
    return res.status(500).json({
      message: "Erreur serveur lors de l'ajout de l'utilisateur au miroir",
      details: err.message,
    });
  }
};

// Supprimer un utilisateur d'un miroir
exports.removeUserFromMirror = async function (req, res) {
  try {
    const mirrorId = req.params.id;
    const userIdToRemove = req.params.userId;
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

    // Vérifier si l'utilisateur à supprimer existe et a accès au miroir
    const userMirrorToRemove = await UserMirror.findOne({
      where: {
        userId: userIdToRemove,
        mirrorId: mirrorId,
      },
    });

    if (!userMirrorToRemove) {
      return res
        .status(404)
        .json({ message: "L'utilisateur n'a pas accès à ce miroir" });
    }

    // Ne pas permettre à l'utilisateur de se supprimer lui-même
    if (Number(userIdToRemove) === Number(userId)) {
      return res.status(400).json({
        message: "Vous ne pouvez pas vous supprimer vous-même du miroir",
      });
    }

    // Supprimer l'association utilisateur-miroir
    await UserMirror.destroy({
      where: {
        userId: userIdToRemove,
        mirrorId: mirrorId,
      },
    });

    return res
      .status(200)
      .json({ message: "Utilisateur supprimé du miroir avec succès" });
  } catch (err) {
    console.error(
      "Erreur lors de la suppression de l'utilisateur du miroir:",
      err
    );
    return res.status(500).json({
      message:
        "Erreur serveur lors de la suppression de l'utilisateur du miroir",
      details: err.message,
    });
  }
};

// Modifier le rôle d'un utilisateur pour un miroir
exports.updateUserRole = async function (req, res) {
  try {
    const mirrorId = req.params.id;
    const userIdToUpdate = req.params.userId;
    const { role } = req.body;
    const userId = req.user.id;

    // Vérifier si le rôle est valide
    if (role !== "user" && role !== "admin") {
      return res.status(400).json({
        message: "Rôle invalide. Les valeurs acceptées sont 'user' ou 'admin'",
      });
    }

    // Vérifier si l'utilisateur est administrateur
    const currentUser = await User.findByPk(userId);
    if (!currentUser.isAdmin) {
      return res
        .status(403)
        .json({ message: "Seul un administrateur peut modifier les rôles" });
    }

    // Vérifier si l'utilisateur à mettre à jour existe
    const userToUpdate = await User.findByPk(userIdToUpdate);
    if (!userToUpdate) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Mettre à jour le rôle (isAdmin)
    await User.update(
      { isAdmin: role === "admin" },
      { where: { idUser: userIdToUpdate } }
    );

    return res.status(200).json({
      message: "Rôle de l'utilisateur mis à jour avec succès",
      user: {
        id: userToUpdate.idUser,
        email: userToUpdate.email,
        role: role,
      },
    });
  } catch (err) {
    console.error("Erreur lors de la mise à jour du rôle:", err);
    return res.status(500).json({
      message: "Erreur serveur lors de la mise à jour du rôle",
      details: err.message,
    });
  }
};
