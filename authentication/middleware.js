const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET 

module.exports = (req, res, next) => {
    let token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    token = token.replace('Bearer ', '');

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (!err) {
            req.user = decoded;
            return next();
        }

        // If token is expired, check for refresh token in session
        if (err.name === 'TokenExpiredError') {
            const refreshToken = req.session.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({ error: "Session expired. Please log in again." });
            }

            jwt.verify(refreshToken, REFRESH_SECRET, (refreshErr, refreshDecoded) => {
                if (refreshErr) {
                    return res.status(403).json({ error: "Invalid refresh token. Please log in again." });
                }

                // Generate new access token
                const newAccessToken = jwt.sign(
                    { userId: refreshDecoded.userId, email: refreshDecoded.email },
                    JWT_SECRET,
                    { expiresIn: '15m' }
                );

                // Attach new token to response header
                res.setHeader('Authorization', `Bearer ${newAccessToken}`);
                req.user = refreshDecoded;
                next();
            });
        } else {
            res.status(403).json({ error: "Invalid token." });
        }
    });
};