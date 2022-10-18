const tokenManager = require("jsonwebtoken");
// récupération de la clef de création de jeton de connection dans le fichier '.env'
const dotenv = require("dotenv");
dotenv.config()
const tokenKey = process.env.TOKEN_KEY

module.exports = (req, res, next) => {
  try {
   const { cookies } = req
    if (!cookies || !cookies.access_token) {
      return res.status(401).json({
        message: 'Missing token in cookie'
      });
    }
    const decodedToken = tokenManager.verify(cookies.access_token, tokenKey);
    const userId = decodedToken.userId;
    req.auth = { userId: userId };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
