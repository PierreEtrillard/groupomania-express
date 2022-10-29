const Post = require("../models/posts");
const User = require("../models/users");

const fs = require("fs");

exports.getAllPosts = (req, res, next) => {
  Post.find()
    .then(async (posts) => {
      const allPostsToFront = posts.map(async (post) => {
        let authorDetails = await User.findById(post.authorId);
        return {
          id: post.id,
          title: post.title,
          author: await authorDetails.name,
          authorPhoto: await authorDetails.photo,
          textContent: post.textContent,
          likers: post.likers,
          imageUrl: post.imageUrl,
          createdAt: post.createdAt,
        };
      });
      Promise.all(allPostsToFront).then((arrayOfPosts) =>
        res.status(200).json(arrayOfPosts)
      );
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

exports.createPost = async (req, res, next) => {
  let newPost = req.body;
  //Suppression de l'id reçu du client par sécurité
  delete newPost._id;
  let imageRef = ""; //préparation d'une variable si post d'image
  if (req.file) {
    imageRef = `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`;
  }
  const post = new Post({
    ...newPost,
    //Récupération de l'userId dans le jeton d'authorization (req.auth)
    authorId: req.auth.userId,
    // authorName: postAuthor.name,
    //Construction de l'URL pour stocker l'image dans le dossier pointé par le middlewear multer-conf.js
    imageUrl: imageRef,
    createdAt: Date.now(),
  });
  post
    .save()
    .then(() => res.status(201).json({ message: "Publication postée !",post:post }))
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
      if (postTargeted.imageUrl !== "") {
        //supression de l'ancienne image si presente dans le post à mettre à jour
        let oldPic = await postTargeted.imageUrl.split("/images/")[1];
        fs.unlinkSync(`images/${oldPic}`);
      }
      //mise à jour de l'image
      postUpdate = {
        ...req.body,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
        authorId: req.auth.userId,
      };
    } else {
      postUpdate = { ...req.body, author: req.auth.userId };
    }
    Post.updateOne(
      { _id: req.params.id },
      { ...postUpdate, _id: req.params.id } //réécrire l'_id présent dans l'url pour le cas ou un autre _id serait inséré dans le body..
    )
      .then(res.status(200).json({ message: "post mise à jour !" }))
      .catch((error) => res.status(400).json({ error }));
  }
};

exports.likePost = async (req, res, next) => {
  console.log("liker userId = "+ req.auth.userId);
  const findPostToLike = Post.findById(req.params.id);
  const findLikeAuthor = User.findById(req.auth.userId);
  Promise.all([findPostToLike, findLikeAuthor]).then((datas) => {
    let postToLike = datas[0];
    let likeAuthor = datas[1];
    //filtrage garantissant l'unicité ou la suppression du like
    let thisPostLikers = postToLike.likers.filter(
      (likerId) => likerId !== likeAuthor.id
    );
    let likeAuthorFavories = likeAuthor.myLikes.filter(
      (postId) => postId !== postToLike.id
    );
    console.log("postToLike.likers sans like: " + postToLike.likers.length);
    console.log("thisPostLikers a utiliser pour l'update sans like: " + thisPostLikers.length);
   
    if (likeAuthor.id !== postToLike.authorId && req.body.likeIt) {
      //l'autheur du post ne peut liker sont propre post
      thisPostLikers.push(likeAuthor.id);
      postToLike.likers = thisPostLikers;
      console.log("postToLike.likers si liKeIt: " + postToLike.likers.length);
      console.log("thisPostLikers a utiliser pour l'update si liKeIt: " + thisPostLikers.length);
      likeAuthorFavories.push(postToLike.id);
      likeAuthor.myLikes = likeAuthorFavories;
    }
    const promisePostLikersUpdate = Post.updateOne({ _id: postToLike.id }, { likers: thisPostLikers });
    const promiseUsersLikesUpdate = User.updateOne({ _id: likeAuthor.id }, { myLikes: likeAuthorFavories });
    Promise.all([promisePostLikersUpdate,promiseUsersLikesUpdate])
      .then(res.status(200).json({ message: "appréciation enregistrée" }))
      .catch((error) => res.status(400).json({ error }));
  });
};
exports.deletePost = async (req, res, next) => {
  //Ciblage de la post à modifier avec l'id présent dans l'url.
  const eraser = await User.findById(req.auth.userId)
  console.log(eraser.name);
  Post.findById( req.params.id).then((post) => {
    //Test si la requète ne provient pas du propriétaire du post.
    if (post.authorId === req.auth.userId || eraser.role ==='gpm-admin') {
       //récupération du nom du fichier,
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
    else {  res.status(401).json({ message: "Non-autorisé !" });
    }
  });
};
