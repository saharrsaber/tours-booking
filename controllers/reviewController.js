const factory = require('./handlerFactory');
const Review = require('./../models/reviewModel');
const appError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

exports.setToursUsersIds = (req, res, next) => {
  req.body.user = req.user._id;
  req.body.tour = req.params.tourId;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createNewReview = factory.createNewOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
