const express = require('express');
const ctrlUser = require('../controllers/users');
const multer = require("../middleware/multer-conf");
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/signin', ctrlUser.createUser)
router.get("/:id",auth,ctrlUser.getUser)
router.post("/:id/update",auth,multer,ctrlUser.profilUpdater)
router.delete("/:id/delete",auth)
router.post('/login', ctrlUser.login)

module.exports = router