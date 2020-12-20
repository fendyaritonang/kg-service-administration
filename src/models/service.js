const mongoose = require('mongoose');
const validator = require('validator');

const serviceSchema = new mongoose.Schema(
  {
    churchCode: {
      type: String,
      required: true,
    },
    title: {
      type: String, // if empty, then it will be replaced by the church name
    },
    status: {
      type: Number,
      default: 2, // 1: published, 2: pending publish
    },
    datetimeStart: {
      type: Date,
      required: true,
    },
    datetimeEnd: {
      type: Date,
      required: true,
      validate(value) {
        if (this.datetimeStart > value) {
          throw new Error(
            'Liturgy end date must be greater than liturgy start date'
          );
        }
      },
    },
    locationCode: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    locationName: {
      type: String,
      required: true,
    },
    reflection: {
      type: String,
    },
    remarks: {
      type: String,
    },
    news: [
      {
        title: {
          type: String,
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        link: {
          type: String,
        },
      },
    ],
    liturgy: [
      {
        title: {
          type: String,
          required: true,
        },
        titleLink: {
          type: String,
        },
        content: {
          type: String,
        },
        contentLink: {
          type: String,
        },
      },
    ],
    servants: [
      {
        serviceRole: {
          type: String,
          required: true,
        },
        servantRole: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
          validate(value) {
            if (!validator.isEmail(value)) {
              throw new Error('Email is invalid.');
            }
          },
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

serviceSchema.statics.isOverlapping = async ({
  churchCode,
  locationCode,
  datetimeStart,
  datetimeEnd,
  serviceId,
}) => {
  let filter;
  if (serviceId) {
    filter = {
      _id: { $ne: serviceId },
      churchCode,
      locationCode,
      datetimeStart: { $lt: new Date(datetimeEnd) },
      datetimeEnd: { $gt: new Date(datetimeStart) },
    };
  } else {
    filter = {
      churchCode,
      locationCode,
      datetimeStart: { $lt: new Date(datetimeEnd) },
      datetimeEnd: { $gt: new Date(datetimeStart) },
    };
  }

  const overlapping = await Service.findOne(filter);

  if (overlapping) {
    return true;
  }

  return false;
};

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
