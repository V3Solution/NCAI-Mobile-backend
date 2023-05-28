const express = require("express");
const router = express.Router();

//Auth User Routes
router.use("/api/v1", require("./api_v1"));
//Google Heatlthcare Api routes
router.use("/api/v1/google",require('./google_heatlth_care/googleapi'))
//System Routes
router.use("/api/v1", require('./systems_api_v1'))
//Sites Routes
router.use("/api/v1", require('./sites_api_v1'))



module.exports = router;
