const tokenManager = require("jsonwebtoken");
// récupération de la clef de création de jeton de connection dans le fichier '.env'
const dotenv = require("dotenv");
dotenv.config()
const tokenKey = process.env.TOKEN_KEY

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];//split extrait le token après le premiére espace (juste aprés le mot 'Bearer')
    const decodedToken = tokenManager.verify(token, tokenKey);
    const userId = decodedToken.userId;
    req.auth = { userId: userId };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
