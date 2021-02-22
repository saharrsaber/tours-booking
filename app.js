// global modules
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// require routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

// utilies
const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// STARTING POINT
const app = express();

// define view engine pug
// app.engine('pug', require('pug').__express);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// MIDDLEWARES

// app static pages[css, image, html] all in public folder
app.use(express.static(path.join(__dirname, `public`)));
// helmet - set secure headers
app.use(helmet());

// morgan - http request logger - display request http method, url, status code, ..
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// rateLimit - limiting #request
const limiter = rateLimit({
  max: 100,
  windowMs: 1000 * 60 * 60,
  message: 'too many requests from this IP, please try again later',
});
app.use('/api', limiter);

// json - body-parser - to have req.body
app.use(express.json({ limit: '10kb' }));

// mongoSanitize - data sanitization noSQL removes $
app.use(mongoSanitize());

// xss - data sanitization convert html tags to html entities
app.use(xss());

// hpp allow having the same paramter twice without error
// app.use(hpp({
//   whitelist: ['duration', ]
// })); //

// ROUTERS
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// Unhandled routes: must be the last routing middleware
// all : all htpp requests, *: all urls
app.all('*', (req, res, next) => {
  // pass an error to next function to
  // skip all middlewares and go directly to error handling middleware
  next(new appError(`Can't find ${req.originalUrl} on this server`, 404));
});

// error handling middleware
app.use(globalErrorHandler);

module.exports = app;
