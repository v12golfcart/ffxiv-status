// 3rd party
const express = require("express");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");

// custom imports
const { port } = require("./config");
const primalScrape = require("./scraper");

// server
const scrape = async () => {
  const res = await primalScrape();
  console.log(res);
};
scrape();

app.get("/", (req, res) => {
  res.send("Hello World!!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
