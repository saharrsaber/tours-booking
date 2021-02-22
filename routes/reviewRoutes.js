const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

// POST /tours/2135/reviews
// POST /reviews
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restictTo('user'),
    reviewController.setToursUsersIds,
    reviewController.createNewReview
  );
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
