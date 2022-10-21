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
        myHobbies:["","","",""],
        connectAt: Date.now(),
      });
      newUser
        .save()
        .then(() => res.status(201).json({ message: "Compte créé !" ,
        userProfile:newUser}))
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
            name:user.name,
            photo:user.photo,
            lastConnectAt: user.connectAt,
            connectAt: Date.now(),
            myLikes:user.myLikes,
            myHobbies:user.myHobbies,
            myEvents:user.myEvents
          };
          res.status(200).json({
            message: "Vous êtes connecté",
            userProfile: userProfile,
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(501).json({ error }));
};
exports.logout = (req, res, next) => {
  res.clearCookie("access_token", {
    httpOnly: true,
  });
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
  const userTargeted = await User.findById(req.params.id);
  let userUpdate = {}; //Contiendra le corp de requète
  const invalidUser = userTargeted.id !== req.auth.userId;
  //si tentative de modification de la post d'un autre user:
  if (invalidUser) {
    res.status(403).json({ message: "Non-autorisé !" });
  } else {
    //Test si la requète contient un fichier form/data (= stringifié par multer):
    if (req.file) {
      //supression de l'ancienne image.
      let oldPic = userTargeted.photo.split("/images/")[1];
      fs.unlinkSync(`images/${oldPic}`);

      userUpdate = {
        ...req.body,
        //mise à jour de l'URL de la nouvelle image
        photo: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
        role: userTargeted.role,
      };
    } else {
      userUpdate = { ...req.body, role: userTargeted.role };
    }
  }
  //Sauvegarde de la mise à jour dans la base de données:
  User.updateOne(
    { _id: req.params.id },
    { ...userUpdate, _id: req.auth.userId } //Ne pas faire confiance à l'Id de la requète: réécrire l'_id présent dans le token pour le cas ou un autre _id serait inséré dans le body..
  )
    .then(res.status(200).json({ message: "profil mise à jour !" }))
    .catch((error) => res.status(400).json({ error }));
};
