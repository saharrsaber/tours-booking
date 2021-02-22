const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// param middleware for tours only
// router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTop5CheapTours, tourController.getAllTours);

router.route('/stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restictTo('admin', 'lead-guide'),
    tourController.createNewTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restictTo('admin', 'lead-guide'),
    authController.protect,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restictTo('user'),
//     reviewController.createNewReview
//   );

router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
