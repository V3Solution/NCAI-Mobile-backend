const router = require("express").Router();
const Site = require("../../models/sitesModel");
const { ErrorHandler } = require("../../config/error");
const auth = require("../auth");
//Create Sites

router.post("/create", async (req, res, next) => {
  try {
    const {
      siteName,
      siteAlias,
      siteAddress,
      shortName,
      rank,
      phoneNumber,
      fullName,
    } = req.body;
    //Validation Error
    const missingFields = [];
    if (!siteName) missingFields.push("Site Name");
    if (!siteAlias) missingFields.push("Site Alias");
    if (!siteAddress) missingFields.push("Site Address");
    // if (!shortName) missingFields.push("Short Name");
    // if (!rank) missingFields.push("Rank");
    // if (!phoneNumber) missingFields.push("Phone Number");
    // if (!fullName) missingFields.push("Full Name");
    if (missingFields.length > 0) {
      return new ErrorHandler(
        400,
        "Missing fields: " + missingFields.toString(),
        missingFields,
        res
      );
    }
    const sites = await Site.create(req.body)
    res.status(201).json({
      success: true,
      message: "Site created successfully...",
      sites,
    });
  } catch (e) {
    next(e);
  }
});

//Get All Organization
router.get("/", async (req, res, next) => {
  try {
    const sites = await Site.find()
      .sort("siteName")
      .select(
        "siteName siteAlias siteAddress dicomSiteContact createdAt updatedAt"
      );
    res.status(201).json({
      success: true,
      message: "Site Loaded successfully...",
      sites,
    });
  } catch (e) {
    next(e);
  }
});
//Get Single Site
router.get("/:id", async (req, res, next) => {
  try {
    const sites = await Site.findById(req.params.id).select(
      "siteName siteAlias siteAddress dicomSiteContact createdAt updatedAt"
    );
    if (!sites) {
      return new ErrorHandler(
        401,
        "Please use right Site ID",
        "Invalid Site ID",
        res
      );
    }
    res.status(200).json({
      success: true,
      message: "Site Loaded successfully",
      sites,
    });
  } catch (e) {
    next(e);
  }
});
//Delete Site
router.delete("/:id", async (req, res, next) => {
  try {
    const sites = await Site.findByIdAndDelete(req.params.id);
    if (!sites) {
      return new ErrorHandler(
        401,
        "Please use right Site ID",
        "Invalid Site ID",
        res
      );
    }
    res.status(200).json({
      success: true,
      message: "Site deleted successfully",
    });
  } catch (e) {
    next(e);
  }
});
//Update Site Data
router.put("/:id", async (req, res, next) => {
  try {
    const sites = await Site.findById(req.params.id);
    if (!sites) {
      return new ErrorHandler(
        401,
        "Please use right Site ID",
        "Invalid Site ID",
        res
      );
    }
    const updatedSites = await Site.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Site updated successfully",
      updatedSites,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
