const express = require("express");
const router = express.Router();
const verificationCheck = require("./verificationCheck.js");

router.use(verificationCheck);

router.post("/", (req, res) => {});

module.exports = router;
