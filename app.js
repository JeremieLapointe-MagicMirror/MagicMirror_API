const express = require("express");
const app = express();
require("dotenv").config();

// Middleware pour parser le JSON
app.use(express.json());

// Importer les routes
const userRoutes = require("./routes/userRoutes");

// Utiliser les routes
app.use("/api/users", userRoutes);

// Route de base pour tester
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API Magic Mirror" });
});

const PORT = process.env.PORT || 3000;

// Démarrage du serveur
app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});
