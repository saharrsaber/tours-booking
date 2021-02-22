const factory = require('./handlerFactory');
const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// routes handlers
const filterObj = (Obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(Obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = Obj[el];
    }
  });
  return newObj;
};

exports.updateMyInfo = catchAsync(async (req, res, next) => {
  // 1. create erroe oif user want to update password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password update', 400));
  }
  // 2. selct only fields that user can update
  const filteredBody = filterObj(req.body, 'name', 'email');
  // 3. update other fields
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});
exports.deleteMyAccount = catchAsync(async (req, res, next) => {
  // get user documents
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    user: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);
