const bcrypt = require("bcrypt");
const User = require("../models/users");
const tokenManager = require("jsonwebtoken");
const validator = require("validator");
// récupération de la clef de création de jeton de connection dans le fichier '.env'
const dotenv = require("dotenv");
dotenv.config();
const tokenKey = process.env.TOKEN_KEY;

exports.createUser = (req, res, next) => {
  console.log(req.body);
  if (
    validator.isEmail(req.body.email) 
  ) {
    //10 passes de cryptages du mot de passe envoyé
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => {
        const newUser = new User({
          name:req.body.email,
          email: req.body.email,
          password: hash,
          photo:"../images/standart-profil-photo.webp",
          role: "normal"});
        newUser
          .save()
          .then(() => res.status(201).json({ message: "Compte créé !" }))
          .catch((error) => res.status(500).json({ error }));
      })
  } else {
    res
      .status(400)
      .send(
        "renseignez un mail valide"
      );
  }
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {

        return res.status(401).json({
          messsage: "mot de passe ou nom d'utilisateur incorrect" /* ! indiquer 
        l'absence de l'user dans la BDD serait une fuite de donnée*/,
        });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({
              messsage: "mot de passe ou nom d'utilisateur incorrect",
            });
          }
          res.status(200).json({
            message: "Vous êtes connectez",
            userId: user._id,
            token: tokenManager.sign({ userId: user._id }, tokenKey, {
              expiresIn: "30d",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(501).json({ error }));
};
exports.getUser = (req, res, next) => {
  User.findOne({ _id: req.params.id })
    .then((user) => {
      res.status(200).json(user);
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
  const invalidUser = userTargeted.id != req.auth.userId;
  //si tentative de modification de la post d'un autre user:
  console.log(req.body);
  if (invalidUser) {
    res.status(403).json({ message: "Non-autorisé !" });
  } else {
    //Test si la requète contient un fichier form/data (= stringifié par multer):
    if (req.file) {
      //Parser la requète
      userUpdate = { ...JSON.parse(req.body.user) };
      //supression de l'ancienne image.
      let oldPic = userTargeted.photo.split("/images/")[1];
      fs.unlinkSync(`images/${oldPic}`);
      //mise à jour de l'URL de la nouvelle image
      userUpdate.photo = `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`;
    } else {
      userUpdate = { ...req.body };
    }
  }
  delete userUpdate.id; //Ne pas faire confiance à l'userId de la requète !
  //Sauvegarde de la mise à jour dans la base de données:
  User.updateOne(
    { _id: req.params.id },
    { ...userUpdate, _id: req.params.id } //réécrire l'_id présent dans l'url pour le cas ou un autre _id serait inséré dans le body..
  )
    .then(res.status(200).json({ message: "profil mise à jour !" }))
    .catch((error) => res.status(400).json({ error }));
  };