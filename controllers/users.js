const bcrypt = require("bcrypt");
const User = require("../models/users");
const tokenManager = require("jsonwebtoken");
const fs = require("fs");
const validator = require("validator");
// récupération de la liste des administrateurs et de la clef de création de jeton de connection dans le fichier '.env'
const dotenv = require("dotenv");
dotenv.config();
const admins = process.env.ADMINISTRATORS;
const tokenKey = process.env.TOKEN_KEY;
const domain = process.env.DOMAIN_IP_ADRESS;
const port = process.env.PORT;

exports.createUser = (req, res, next) => {
  if (validator.isEmail(req.body.email)) {
    //évaluation si l'utilisteur est un administrateur
    let privilege = "";
    admins.includes(req.body.email)
      ? (privilege = "gpm-admin")
      : (privilege = "normal");
    //10 passes de cryptages du mot de passe envoyé
    bcrypt.hash(req.body.password, 10).then((hash) => {
      const newUser = new User({
        name: req.body.email,
        email: req.body.email,
        password: hash,
        photo: `${domain}:${port}/images/standart-profil-photo.webp`,
        role: privilege,
        connectAt: Date.now(),
        lastConnectAt: 0,
        myLikes: [],
      });
      newUser
        .save()
        .then((userRegistred) => {
          const access_token = tokenManager.sign(
            { userId: userRegistred._id },
            tokenKey
          );
          const expiryDate = new Date(Date.now() + 24 * 30 * 60 * 60 * 1000);
          res
            .cookie("access_token", access_token, {
              httpOnly: true,
              expires: expiryDate,
            })
            .status(201)
            .json({
              message: "Compte créé !",
              userProfile: {
                email: newUser.email,
                name: newUser.name,
                photo: newUser.photo,
                role: newUser.role,
                connectAt: Date.now(),
                lastConnectAt: 0,
                myLikes: newUser.myLikes,
              },
            });
        })
        .catch((error) => res.status(500).json({ error }));
    });
  } else {
    res.status(400).send("renseignez un mail valide");
  }
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          messsage: "Mail ou mot de passe incorrect" /* ! indiquer 
        l'absence de l'user dans la BDD serait une fuite de donnée*/,
        });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({
              messsage: "Mail ou mot de passe incorrect",
            });
          }
          const access_token = tokenManager.sign(
            { userId: user._id },
            tokenKey
          );
          const expiryDate = new Date(Date.now() + 24 * 30 * 60 * 60 * 1000);
          res.cookie("access_token", access_token, {
            httpOnly: true,
            expires: expiryDate,
          });
          const userProfile = {
            email: user.email,
            name: user.name,
            photo: user.photo,
            role: user.role,
            connectAt: Date.now(),
            lastConnectAt: user.connectAt,
            myLikes: user.myLikes,
          };
          User.updateOne({ _id: user._id }, userProfile).then(
            res.status(200).json({
              message: "Vous êtes connecté",
              userProfile: userProfile,
            })
          );
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(501).json({ error }));
};

exports.logout = (req, res, next) => {
  res.clearCookie("access_token", { httpOnly: true });
  res.status(200).json({ message: "Vous êtes déconnecté" });
};

exports.getUser = (req, res, next) => {
  User.findOne({ _id: req.auth.userId })
    .then((user) => {
      userProfile = user;
      userProfile.password = "not visible";
      res.status(200).json(userProfile);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};
exports.getAllUser = (req, res, next) => {
  User.find()
    .then((users) => {
      const usersProfiles = users;
      usersProfiles.forEach((user) => {
        user.password = "not visible";
      });
      res.status(200).json(usersProfiles);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.profilUpdater = async (req, res, next) => {
  const userTargeted = await User.findById(req.auth.userId);
  // console.log(req.body);

  let userUpdate = {}; //Contiendra le corp de requète
  let photo = ""; //préparation d'une variable si post d'une photo de profile
  if (req.file) {
    //suppression de l'ancienne photo si ce n'est pas la photo par defaut)
    if (
      userTargeted.photo !==
      `${domain}:${port}/images/standart-profil-photo.webp`
    ) {
      let oldPhoto = userTargeted.photo.split("/images/")[1];
      fs.unlinkSync(`images/${oldPhoto}`);
    }
    photo = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
    userUpdate.photo = photo
  }
  userUpdate.name=req.body.name
  userUpdate.email=req.body.email
  console.log(userUpdate);
  //Sauvegarde de la mise à jour dans la base de données:
  User.updateOne(
    { _id: req.auth.userId },
    { ...userUpdate,_id: req.auth.userId } //Ne pas faire confiance à l'Id de la requète: réécrire l'_id présent dans le token pour le cas ou un autre _id serait inséré dans le body..
  )
    .then(res.status(200).json({ message: "profil mise à jour !" }))
    .catch((error) => res.status(400).json({ error }));
};
