const express = require("express");
const app = express();
require("dotenv").config();

// Middleware pour parser le JSON
app.use(express.json());

// Importer les routes
const userRoutes = require("./routes/userRoutes");
const mirrorRoutes = require("./routes/mirrorRoutes");
const widgetRoutes = require("./routes/widgetRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const systemRoutes = require("./routes/systemRoutes");

// Utiliser les routes
app.use("/api/users", userRoutes);
app.use("/api/mirrors", mirrorRoutes);
app.use("/api/mirrors/:id/widgets", widgetRoutes);
app.use("/api/mirrors/:id/users", permissionRoutes);
app.use("/api/mirrors/:id/system", systemRoutes);

// Route de base pour tester
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API Magic Mirror" });
});

const PORT = process.env.PORT || 3001;

// Démarrage du serveur
app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});
