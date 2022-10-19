const express = require('express');
const ctrlUser = require('../controllers/users');
const multer = require("../middleware/multer-conf");
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/signin', ctrlUser.createUser)
router.get("/profile/all",auth,ctrlUser.getAllUser)
router.get("/profile/one",auth,ctrlUser.getUser)
router.post("/:id/update",auth,multer,ctrlUser.profilUpdater)
router.delete("/:id/delete",auth)
router.post('/login', ctrlUser.login)
router.post('/logout', ctrlUser.logout)

module.exports = router