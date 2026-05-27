const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Todos los campos son obligatorios" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "El correo ya está registrado" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });

    const user = await User.create({ name, email, password: hashedPassword, verificationToken });

    res.status(201).json({ message: "Usuario registrado correctamente", userId: user._id, verificationToken });
  } catch (error) {
    res.status(500).json({ message: "Error en el registro", error: error.message });
  }
};

const verifyAccount = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email, verificationToken: token });
    if (!user) return res.status(400).json({ message: "Token inválido" });

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ message: "Cuenta verificada correctamente" });
  } catch (error) {
    res.status(400).json({ message: "Token inválido o expirado" });
  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });
    user.resetToken = resetToken;
    await user.save();

    res.json({ message: "Token de recuperación generado", resetToken });
  } catch (error) {
    res.status(500).json({ message: "Error al recuperar contraseña", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email, resetToken: token });
    if (!user) return res.status(400).json({ message: "Token inválido" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    await user.save();

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    res.status(400).json({ message: "Token inválido o expirado" });
  }
};

module.exports = { register, verifyAccount, forgotPassword, resetPassword };