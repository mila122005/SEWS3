const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");

const app = express();

// ==============================
// CORS VERCEL + LOCALHOST
// ==============================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sews-3-camila-s-projects-39088000.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

// ==============================
// RUTAS
// ==============================

app.get("/", (req, res) =>
  res.send("API Auth funcionando")
);

app.use("/api/auth", authRoutes);

// ==============================
// MONGODB
// ==============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    console.log("MongoDB conectado")
  )
  .catch((error) =>
    console.error(error.message)
  );

// ==============================
// SERVER
// ==============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`Servidor en puerto ${PORT}`)
);