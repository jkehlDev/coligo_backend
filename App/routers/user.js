const express = require('express');
const controllerUser = require('../controllers/user');
const router = express.Router();

router.get('/signin', controllerUser.signIn);
router.get('/signOut', controllerUser.signOut);
router.patch('/signUpdate', controllerUser.signUpdate);
router.post('/signUp', controllerUser.signUp);
router.delete('/signDelete', controllerUser.signDelete);

module.exports = router;
