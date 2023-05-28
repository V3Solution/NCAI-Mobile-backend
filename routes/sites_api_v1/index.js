const express = require("express");
const router = express.Router();


router.use("/sites", require("./sites"));

module.exports = router;
