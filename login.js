// login.js

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

const router = express.Router();
const secret = "your_jwt_secret";

// Rejestracja
router.post("/register", async (req, res) => {
  const { username, password, role = "user" } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword, role });
  try {
    await user.save();
    res.status(201).send("User registered");
  } catch (err) {
    res.status(400).send("Error registering user: " + err.message);
  }
});

// Logowanie
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send("Invalid credentials");
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send("Invalid credentials");
    }
    const role = user.role;
    const token = jwt.sign(
      { _id: user._id, username: user.username, role },
      secret
    );
    res.json({ token, username: user.username, role, _id: user._id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
