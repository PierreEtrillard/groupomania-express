const express = require('express');
const ctrlUser = require('../controllers/users');
const multer = require("../middleware/multer-conf");
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/signin', ctrlUser.createUser)
router.post('/login', ctrlUser.login)
router.post('/logout', ctrlUser.logout)
router.get("/profile/all",auth,ctrlUser.getAllUser)
router.put("/update",auth,multer,ctrlUser.profilUpdater)

module.exports = router