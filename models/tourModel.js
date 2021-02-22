const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: 'string',
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maxGroupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      trim: true,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        errMsg: 'this field must be easy medium or difficult only',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: { type: String, trim: true },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a coverImg'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    // GeoJSON OBJECT NOT OPTION OBJECT
    // EMMBEDED DENORMALIZED DATASET- EACH object represents a small document that has its own id
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], //lng then lat
      address: String,
      description: String,
    },
    // Array of GeoJSON
    // create new document inside paret document
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number], //lng then lat
        address: String,
        description: String,
        day: Number,
      },
    ],
    //  REFERENCES OBJECT
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1 });
tourSchema.index({ slug: 1 });
tourSchema.virtual('durationWeeks').get(function () {
  // an expressin fn is used instead of arrow functions because we need to use 'this'
  return this.duration / 7;
});
// VIRTUAL populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  // foreignField in Review Collection is called 'tour'
  // that matched the localField in this collection '_id'
  foreignField: 'tour',
  localField: '_id',
});

// document middlewar: runs before  .save() .create()
tourSchema.pre('save', function (next) {
  // this -> document being saved
  // slugify the name
  this.slug = slugify(this.name, { lower: true });

  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
