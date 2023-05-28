const express = require("express");
const router = express.Router();

router.use("/systems", require("./systems"));

module.exports = router;
