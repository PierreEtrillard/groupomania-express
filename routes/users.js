const express = require('express');
const ctrlUser = require('../controllers/users')
const router = express.Router();

router.post('/signin', ctrlUser.createUser)
router.post('/login', ctrlUser.login)

module.exports = router