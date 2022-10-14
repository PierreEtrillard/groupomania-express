const Post = require("../models/posts");
const fs = require("fs");

exports.getAllPosts = (req, res, next) => {
  Post.find()
    .then((posts) => {
      res.status(200).json(posts);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.getPost = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      res.status(200).json(post);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.createPost = (req, res, next) => {
  let newPost = req.body;
  //Suppression de l'userId reçu du client par sécurité
  delete newPost._id;
  let imageRef = ""; //préparation d'une varaible si post d'image
  if (req.file) {
    imageRef = `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`;
  }
  const post = new Post({
    ...newPost,
    //Récupération de l'userId dans le jeton d'authorization (req.auth)
    author: req.auth.userId,
    //Construction de l'URL pour stocker l'image dans le dossier pointé par le middlewear multer-conf.js
    imageUrl: imageRef,
  });
  post
    .save()
    .then(() => res.status(201).json({ message: "Publication postée !" }))
    .catch((error) => res.status(400).json({ message: error }));
};

exports.modifyPost = async (req, res, next) => {
  const postTargeted = await Post.findById(req.params.id);
  let postUpdate = {};
  const invalidUser = postTargeted.author !== req.auth.userId;
  if (invalidUser) {
    res.status(403).json({ message: "Non-autorisé !" });
  } else {
    //Test si la requète contient un fichier form/data (= stringifié par multer):
    if (req.file) {
      if(postTargeted.imageUrl!== "")
      {//supression de l'ancienne image si presente dans le post à mettre à jour
      let oldPic =await postTargeted.imageUrl.split("/images/")[1];
      fs.unlinkSync(`images/${oldPic}`);}
      //mise à jour de l'image
      postUpdate = {
        ...req.body,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
        author:req.auth.userId
      };
    } else {
      postUpdate = { ...req.body,author:req.auth.userId };
    }
    Post.updateOne(
      { _id: req.params.id },
      { ...postUpdate, _id: req.params.id } //réécrire l'_id présent dans l'url pour le cas ou un autre _id serait inséré dans le body..
    )
      .then(res.status(200).json({ message: "post mise à jour !" }))
      .catch((error) => res.status(400).json({ error }));
  }
};

exports.likePost = (req, res, next) => {
  Post.findById(req.params.id)
    .then((post) => {
      // Suppression de l'userId si déja présent dans les tableaux: usersLiked et usersDisliked
      const postAuthor = post.author;
      let likersIds = post.usersLikers.filter(
        (idList) => idList !== req.auth.userId
      );
      if (req.body.likeIt && req.auth.userId !== postAuthor) {
        likersIds.push(req.auth.userId);
      }
      post.usersLikers = likersIds;
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
exports.deletePost = (req, res, next) => {
  //Ciblage de la post à modifier avec l'id présent dans l'url.
  Post.findOne({ _id: req.params.id }).then((post) => {
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
          post
            .deleteOne({ _id: req.params.id })
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
