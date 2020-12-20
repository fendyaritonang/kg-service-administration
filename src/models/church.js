const mongoose = require('mongoose');
const validator = require('validator');

const churchSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    address: {
      type: String,
    },
    timeOffset: {
      type: Number,
      required: true,
    },
    status: {
      type: Number,
      default: 2, // pending verification
    },
    admins: [
      {
        admin: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
          validate(value) {
            if (!validator.isEmail(value)) {
              throw new Error('Email admin is invalid.');
            }
          },
        },
      },
    ],
    servants: [
      // changes to servants information will update service servants of future services
      {
        email: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
          validate(value) {
            if (!validator.isEmail(value)) {
              throw new Error('Email is invalid.');
            }
          },
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
        role: {
          type: String,
        },
        status: {
          type: Number,
          default: 1,
        },
      },
    ],
    locations: [
      {
        code: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
        location: {
          type: String,
          required: true,
        },
        status: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

churchSchema.methods.toJSON = function () {
  const church = this;
  const churchObject = church.toObject();

  delete churchObject.admins;
  delete churchObject.servants;
  delete churchObject.status;

  return churchObject;
};

churchSchema.statics.isChurchAdmin = async (churchCode, adminEmail) => {
  const church = await Church.findOne({ code: churchCode });
  if (!church) {
    return false;
  }

  churchAdmin = church.admins.filter((o) => o.admin === adminEmail);
  if (!churchAdmin || (churchAdmin && churchAdmin.length === 0)) {
    return false;
  }

  return church;
};

churchSchema.statics.isChurchAdminAndAvailable = async (
  churchCode,
  adminEmail
) => {
  const church = await Church.isChurchAdmin(churchCode, adminEmail);
  if (!church) {
    return false;
  }
  if (church.status !== 1) {
    return false;
  }

  return church;
};

const Church = mongoose.model('Church', churchSchema);

module.exports = Church;
