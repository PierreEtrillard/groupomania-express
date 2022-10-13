const express = require("express");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-conf");
const ctrlPosts = require("../controllers/posts");
const router = express.Router();

router.get("/", auth, ctrlPosts.getAllPosts);
router.get("/:id", auth, ctrlPosts.getPost);
router.post("/", auth, multer, ctrlPosts.createPost);
router.put("/:id", auth, multer, ctrlPosts.modifyPost);
router.post("/:id/like", auth, ctrlPosts.likePost);
router.delete("/:id", auth, ctrlPosts.deletePost);

module.exports = router;