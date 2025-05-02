const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const session = require('express-session');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
 // Keep this secret
 const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

 router.use(session({
    secret: REFRESH_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true }  // Set secure: true in production (HTTPS)
}));

const generateTokens = (user) => {
    const accessToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id, email: user.email }, REFRESH_SECRET, { expiresIn: '7d' });

    return { accessToken, refreshToken };
};

// User Signup
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", 
            [username, email, hashedPassword]);
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Signup failed. Try again.",err });
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [[user]] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const { accessToken, refreshToken } = generateTokens(user);
        req.session.refreshToken = refreshToken;
        // const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: "Login successful!", accessToken });
    } catch (err) {
        res.status(500).json({ error: "Login failed. Try again." });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: "Logout failed." });
        res.json({ message: "Logout successful!" });
    });
});

module.exports = router;
