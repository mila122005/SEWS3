const express = require("express");
const router = express.Router();

const {
  register,
  verifyAccount,
  forgotPassword,
  resetPassword,
  login
} = require("../controllers/auth.controller");

router.post("/register", register);
router.get("/verify/:token", verifyAccount);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/login", login);

module.exports = router;