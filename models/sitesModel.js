const mongoose = require("mongoose");

const siteSchema = new mongoose.Schema(
  {
    //Attribute defined by Junaid Kalia Oganization = Site
    siteName: {
      type: String,
      required: true,
    },
    siteAlias: {
      type: String,
      unique: true,
    },
    siteAddress: {
      type: String,
      required: true,
    },
    dicomSiteContact: [
      {
        shortName: {
          type: String,
          required: true,
        },
        rank: {
          type: Number,
          required: true,
        },
        phoneNumber: {
          type: String,
          unique: true,
          required: true,
        },
        fullName: {
          type: String,
          maxlength: 30,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Site", siteSchema);
