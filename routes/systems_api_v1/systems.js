const router = require("express").Router();
const System = require("../../models/systemsModel");
const User  = require("../../models/User")
const { ErrorHandler } = require("../../config/error");
const google = require("@googleapis/healthcare");
const healthcare = google.healthcare({
  version: "v1",
  auth: new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  }),
});

//Create System
router.post("/create", async (req, res, next) => {
  try {
    console.log(req.body);
    // Create system In Google Cloud
    let cloudRegion = "us";
    let projectId = "rich-archery-387806";
    let datasetId = req.body.alias;
    let parent = `projects/${projectId}/locations/${cloudRegion}`;
    let request = { parent, datasetId };
    try {
      await healthcare.projects.locations.datasets.create(request);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error While Creating System On Google Cloud, try Again",
        error: error.message,
      });
    }
    //Create Site In Google Cloud
    req.body.sites.map(async (site) => {
      cloudRegion = "us";
      projectId = "rich-archery-387806";
      datasetId = datasetId;
      dicomStoreId = site.name;
      parent = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}`;
      request = { parent, dicomStoreId };
      try {
        await healthcare.projects.locations.datasets.dicomStores.create(
          request
        );
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Error While Creating Site On Google Cloud, try Again",
          error: error.message,
        });
      }
    });
    const systems = await System.create(req.body);

    res.status(201).json({
      success: true,
      message: "System created successfully",
      systems,
    });
  } catch (e) {
    next(e);
  }
});

//Get All System
router.get("/", async (req, res, next) => {
  try {
    const system = await System.find().sort("siteName").populate("sites.site");
    res.status(200).json({
      success: true,
      message: "System Loaded Successfully",
      system,
    });
  } catch (e) {
    next(e);
  }
});

//Delete System
router.delete("/:id", async (req, res, next) => {
  try {
    const system = await System.findByIdAndDelete(req.params.id);
    await User.deleteMany({systemAccess:req.params.id})
    if (!system) {
      return new ErrorHandler(
        401,
        "Please use right System ID",
        "Invalid System ID",
        res
      );
    }
    res.status(200).json({
      success: true,
      message: "System deleted successfully",
    });
  } catch (e) {
    next(e);
  }
});

//Get Single System
router.get("/:id", async (req, res, next) => {
  try {
    const system = await System.findById(req.params.id).populate("sites.site");
    if (!system) {
      return new ErrorHandler(
        401,
        "Please use right System ID",
        "Invalid System ID",
        res
      );
    }
    res.status(200).json({
      success: true,
      message: "System Loaded successfully",
      system,
    });
  } catch (e) {
    next(e);
  }
});

//Update System Data
router.put("/:id", async (req, res, next) => {
  try {
    const system = await System.findById(req.params.id);
    if (!system) {
      return new ErrorHandler(
        401,
        "Please use right Site ID",
        "Invalid Site ID",
        res
      );
    }
    const updatedSystem = await System.findByIdAndUpdate(
      req.params.id,
      {
        fullName: req.body.fullName,
        alias: req.body.alias,
      },
      { new: true, runValidators: true, useFindAndModify: false }
    );
    res.status(200).json({
      success: true,
      message: "System updated successfully",
      updatedSystem,
    });
  } catch (e) {
    next(e);
  }
});

//Add More Sites
router.put("/addsites/:systemID", async (req, res, next) => {
  try {
    const system = await System.findById(req.params.systemID);
    if (!system) {
      return new ErrorHandler(
        401,
        "Please use right Site ID",
        "Invalid Site ID",
        res
      );
    }
    const Newsite = {
      site: req.body.site
    }
    system.sites.push(Newsite)
    await system.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: "System updated successfully",
      system,
    });
  } catch (e) {
    next(e);
  }
});


module.exports = router;
