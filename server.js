// server.js
// Entry point del servicio ACQUIRE
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const acquireRoutes = require("./routes/acquireRoutes");

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

const app = express();
app.use(express.json());

// Conectar a MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("[ACQUIRE] Conectado a MongoDB"))
  .catch((err) => {
    console.error("[ACQUIRE] Error conectado a MongoDB:", err);
    process.exit(1);
  });

// Rutas del servicio ACQUIRE
app.use("/", acquireRoutes);

// Arranque del servidor
app.listen(PORT, () => {
  console.log(`[ACQUIRE] Servicio escuchando en http://localhost:${PORT}`);
});