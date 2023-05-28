const mongoose = require("mongoose");

const systemSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  alias: {
    type: String,
    required: true,
    unique: true,
  },
  sites: [
    {
      site: {
        type: mongoose.Types.ObjectId,
        ref: "Site",
      },
    },
  ],
},{timestamps: true});

module.exports = mongoose.model("System", systemSchema);
