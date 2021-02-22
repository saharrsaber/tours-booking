const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const userToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const SendToken = (user, status, res) => {
  const token = userToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    // secure: true,
    httpOnly: true,
  });

  // to hide password
  user.password = undefined;
  res.status(status).json({
    status: 'success',
    token,
    data: { user },
  });
};
// post /users - create new user, simply means sign up
exports.signUp = catchAsync(async (req, res, next) => {
  // specified to only send this data to database
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // passwordChangedAt: req.body.passwordChangedAt,
    photo: req.body.photo,
  });

  // as soon as he signed up he logged in
  SendToken(newUser, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1.check if email and password exist !empty
  if (!email || !password) {
    return next(
      new AppError('Please provide a valid email and password!', 400)
    );
  }
  // 2.check if user exists in db and password is correct
  const user = await User.findOne({ email }).select('+password');
  const correct = await user?.correctPassword(password, user?.password);
  if (!user || !correct) {
    return next(
      new AppError('Please enter a valid email and a correct password', 401)
    );
  }

  // 3.send token back to client
  SendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. get token from clinet
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get accces', 401)
    );
  }
  // 2. validate the token jwt
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  /* must be handled in error controller as they are non operational errors
  // if (!decoded) {
  //   return next(new AppError('Ohh! Please login to get accces', 401));
  // }*/

  // 3. check if the user is exist
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('User is not found!', 401));
  }
  // 4. check if user changed password
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Please enter the new password', 401));
  }

  req.user = user;
  next();
});

exports.restictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you don't have the pression to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1. get user based on the posted email address
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('Please enter a valid email', 401));
  }
  // 2. create a random token
  const token = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. sent the token back as a email
  const restURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${token}`;
  const message = `Forget Password? Click here to reset ${restURL}`;
  try {
    await sendEmail({
      email: req.body.email,
      subject: 'Password reset Token',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'token is sent via email',
    });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('error while sending email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. get user based on tokens
  const { token } = req.params;
  const hasedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hasedToken,
    // 2.check expiration date
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or expired'), 400);
  }

  // 3. update  password and changedpasswordAt property
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.changePasswordAt = Date.now() - 1000;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  // 4. login user send new jwt
  SendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1.get user from jwttoken
  // // done by calling protect middleware
  // 2.check the current password
  const { currentPassword } = req.body;

  if (!req?.user?.correctPassword(currentPassword, req?.user.password)) {
    return next(new AppError('Please enter the correct password', 401));
  }
  // 3. update  password and changedpasswordAt property
  req.user.password = req.body.password;
  req.user.passwordConfirm = req.body.passwordConfirm;
  req.user.changePasswordAt = Date.now() - 1000;
  await req.user.save();
  // 4. login user send new jwt
  SendToken(req.user, 200, res);
});
