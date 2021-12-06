const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  console.log("hielooasdofsafdsfad;f a");
  res.send("hi");
});

module.exports = router;
