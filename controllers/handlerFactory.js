const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const APIFeatures = require('./../utils/APIFeatures');

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // EXECUTING: here await to retrive the actual documents
    const data = await features.query;

    // SENDING RESPONSE
    res.status(200).json({
      status: 'success',
      results: data.length,
      data,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id).populate(popOptions);
    if (popOptions) query = query.populate(popOptions);
    const item = await query;
    if (!item) throw new appError('invalid id', 404);
    res.status(200).json({
      status: 'success',
      data: { item },
    });
  });

exports.createNewOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newItem = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { newItem },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const updatedItem = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedItem) throw new appError('invalid id', 404);
    res.status(200).json({
      status: 'success',
      data: { updatedItem },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const deletedItem = await Model.findByIdAndDelete(req.params.id);
    if (!deletedItem) throw new appError('invalid id', 404);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
