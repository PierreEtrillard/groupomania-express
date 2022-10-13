const post = require("../models/posts");
const fs = require("fs");
/* --- ASTUCE!: les middlewears suivant utilisent des spread operator(fr:décomposition) : '...'
cette synthaxe permet d'appeler tous les itérables de tableau ou d'objets (toutes les 
clés de chaque posts requétées dans notre cas). Pour plus d'expliquations, voir :
https://www.devenir-webmaster.com/V2/TUTO/CHAPITRE/JAVASCRIPT/56-destructuring-spread-operator/
https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Spread_syntax#exemple_interactif
--- */

exports.getAllPosts = (req, res, next) => {
  post.find()
    .then((posts) => {
      res.status(200).json(posts);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.getpost = (req, res, next) => {
  post.findOne({ _id: req.params.id })
    .then((post) => {
      post.dislikes = post.usersDisliked.length;
      post.likes = post.usersLiked.length;
      res.status(200).json(post);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.createpost = (req, res, next) => {
  //la requète est convertis en form/data(String) par mutler il faut donc la parser
  const postObject = JSON.parse(req.body.post);
  //Suppression de l'userId reçu du client par sécurité
  delete postObject._id;
  const post = new post({
    ...postObject,
    //Récupération de l'userId dans le jeton d'authorization (req.auth)
    userId: req.auth.userId,
    //Construction de l'URL pour stocker l'image dans le dossier pointé par le middlewear multer-conf.js
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  post
    .save()
    .then(() => res.status(201).json({ message: "Recette ajoutée !" }))
    .catch((error) => res.status(400).json({ message: error }));
};

exports.modifypost = async (req, res, next) => {
  const postTargeted = await post.findById(req.params.id);
  let postUpdate = {}; //Contiendra le corp de requète
  const invalidUser = postTargeted.userId != req.auth.userId;
  //si tentative de modification de la post d'un autre user:
  if (invalidUser) {
    res.status(403).json({ message: "Non-autorisé !" });
  } else {
    //Test si la requète contient un fichier form/data (= stringifié par multer):
    if (req.file) {
      //Parser la requète
      postUpdate = { ...JSON.parse(req.body.post) };
      //supression de l'ancienne image.
      let oldPic = postTargeted.imageUrl.split("/images/")[1];
      fs.unlinkSync(`images/${oldPic}`);
      //mise à jour de l'URL de la nouvelle image
      postUpdate.imageUrl = `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`;
    } else {
      postUpdate = { ...req.body };
    }
  }

  delete postUpdate.userId; //Ne pas faire confiance à l'userId de la requète !
  //Sauvegarde de la mise à jour dans la base de données:
  post.updateOne(
    { _id: req.params.id },
    { ...postUpdate, _id: req.params.id } //réécrire l'_id présent dans l'url pour le cas ou un autre _id serait inséré dans le body..
  )
    .then(res.status(200).json({ message: "post mise à jour !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deletepost = (req, res, next) => {
  //Ciblage de la post à modifier avec l'id présent dans l'url.
  post.findOne({ _id: req.params.id }).then((post) => {
    //Test si la requète ne provient pas du propriétaire de la post.
    if (post.userId != req.auth.userId) {
      res.status(401).json({ message: "Non-autorisé !" });
    } //Si la requète provient bien du propriétaire: récupération du nom du fichier,
    else {
      const filename = post.imageUrl.split("/images/")[1];
      //supression du fichier image,
      fs.unlink(
        `images/${filename}`,
        //puis suppression définitive de l'objet/post dans la BDD.
        () => {
          post.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "post supprimée" });
            })
            .catch((error) => {
              res.status(400).json({ error });
            });
        }
      );
    }
  });
};

exports.likepost = (req, res, next) => {
  post.findById(req.params.id)
    .then((post) => {
      // Suppression de l'userId si déja présent dans les tableaux: usersLiked et usersDisliked
      let likersIds = post.usersLiked.filter(
        (idList) => idList !== req.auth.userId
      );
      let dislikersIds = post.usersDisliked.filter(
        (idList) => idList !== req.auth.userId
      );
      switch (req.body.like) {
        case 1: // l'utilisateur like la post
          likersIds.push(req.auth.userId);
          break;
        case -1: // l'utilissateur dislike la post
          dislikersIds.push(req.auth.userId);
          break;
      }
      post.usersLiked = likersIds;
      post.usersDisliked = dislikersIds;
      post.save().then(() => {
        res.status(200).json({ message: "appréciation enregistrée" });
      });
    })
    .catch((error) => {
      res.status(400).json({
        error,
      });
    });
};
