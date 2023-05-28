const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: String,
  lastName:String,
  avatar: String,
  phone: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
    required: "Email address is required",
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  password: String,
  gender: String,
  dob: String,
  address: [String],
  access: [
    {
      systemAccess: {
        type: mongoose.Types.ObjectId,
        ref: "System",
      },
      siteAccess: {
        type: mongoose.Types.ObjectId,
        ref: "Site",
      },
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
  specialty: {
    type: String,
    required: true,
    enum: [
      "neurologist",
      "Neurologist",
      "radiologist",
      "Radiologist",
      "Other",
      "other",
    ],
  },
  role: {
    type: String,
    default: "",
    enum: ["SuperAdmin", "Admin", "Clinician",],
  },
  contacts: [],
  blocked: [],
  blockedFrom: [],
  devices: [String],
  createdAt: { type: Date, default: new Date() },
},{timestamps: true});

UserSchema.methods.setPassword = function (password) {
  this.password = bcrypt.hashSync(password, 8);
};

UserSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.generateJWT = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    "secret"
  );
};

UserSchema.methods.toAuthJSON = function () {
  return {
    _id: this._id,
    email: this.email,
    token: this.generateJWT(),
  };
};

module.exports = mongoose.model("User", UserSchema);
