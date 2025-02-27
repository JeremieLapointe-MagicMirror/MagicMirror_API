const validator = require("validator");
const bcrypt = require("bcrypt");
const jwtUtil = require("../util/jwtUtil");
const sequelize = require("../config/database");
const { User } = require("../models");

function sanitizeField(field) {
  return validator.escape(field);
}

exports.register = async function (req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Nettoyage des champs pour éviter les injections
    let tempEmail = sanitizeField(email);
    let tempPassword = sanitizeField(password);
    let tempFirstName = firstName ? sanitizeField(firstName) : null;
    let tempLastName = lastName ? sanitizeField(lastName) : null;

    if (
      email !== tempEmail ||
      password !== tempPassword ||
      (firstName && firstName !== tempFirstName) ||
      (lastName && lastName !== tempLastName)
    ) {
      return res.status(400).send({
        message: "Champs invalides. Veuillez vérifier les caractères spéciaux.",
      });
    }

    // Vérification des champs requis
    if (!(email && password)) {
      return res
        .status(400)
        .send({ message: "Email et mot de passe sont requis" });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).send({
        message: "Un utilisateur avec cet email existe déjà",
      });
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: firstName || null,
      lastName: lastName || null,
      isAdmin: false,
      createdAt: new Date(),
    });

    return res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: user.idUser,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error("Erreur lors de l'inscription:", err);
    return res.status(500).send({
      message: "Erreur serveur lors de la création de l'utilisateur",
      details: err.message,
    });
  }
};

exports.login = async function (req, res) {
  try {
    const { email, password } = req.body;

    // Vérification des champs requis
    if (!(email && password)) {
      return res
        .status(400)
        .send({ message: "Email et mot de passe sont requis" });
    }

    // Nettoyage des champs
    let tempEmail = sanitizeField(email);
    let tempPassword = sanitizeField(password);

    if (email !== tempEmail || password !== tempPassword) {
      return res.status(400).send({
        message: "Champs invalides. Veuillez vérifier les caractères spéciaux.",
      });
    }

    // Recherche de l'utilisateur
    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Mise à jour du dernier login
      await User.update(
        { lastLogin: new Date() },
        { where: { idUser: user.idUser } }
      );

      // Génération du token JWT
      const token = jwtUtil.generateAccessToken({
        id: user.idUser,
        email: user.email,
        type: user.isAdmin ? "admin" : "user",
      });

      res.status(200).json({
        message: "Connexion réussie",
        token,
        user: {
          id: user.idUser,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
        },
      });
    } else {
      res.status(401).send({ message: "Email ou mot de passe invalide" });
    }
  } catch (err) {
    console.error("Erreur lors de la connexion:", err);
    res.status(500).send({ message: "Erreur serveur lors de la connexion" });
  }
};

exports.getCurrentUser = async function (req, res) {
  try {
    // req.user est défini par le middleware d'authentification
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "idUser",
        "email",
        "firstName",
        "lastName",
        "isAdmin",
        "createdAt",
        "lastLogin",
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Erreur lors de la récupération du profil:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
