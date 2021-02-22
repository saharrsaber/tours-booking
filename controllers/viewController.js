const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  // 1. get tour data from collectionName
  const tours = await Tour.find();
  // 2. build template
  // 3.render the template using data
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res) => {
  // 1. get data of requested tour + reviews+guides
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  // 2. build the template
  // 3. render the template using data
  console.log(tour);
  res.status(200).render('tour', {
    tour,
  });
});
