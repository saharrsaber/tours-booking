const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const router = express.Router();

// user routes
// open to public
router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// protected
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.patch('/updateMyInfo', userController.updateMyInfo);
router.delete('/deleteMyAccount', userController.deleteMyAccount);
router
  .route('/me')
  .get(authController.protect, userController.getMe, userController.getUser);

// admin routes
router.use(authController.restictTo('admin'));
router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
