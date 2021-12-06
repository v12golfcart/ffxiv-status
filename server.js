/* ++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++ 3RD PARTY ++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++ */
const express = require("express");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");
var cron = require("node-cron");

/* ++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++ CUSTOM IMPORTS ++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++ */
const { port } = require("./config");
const primalScrape = require("./scraper");

/* ++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++ CRON JOB ++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++ */

const check = () => {
  console.log("Starting the cron job");
  cron.schedule("*/15 * * * * *", async () => {
    const webhookUrl =
      "https://discord.com/api/webhooks/917217028610351165/hKgCnLc7RHLl6ikAVnAheTKqxi1PFRbgHV0fgYSH68CfmDThF1WMynyaDM_N8b1u9GYs";

    // get latest server status
    const status = await primalScrape();
    console.log(status);

    try {
      // if error
      if (!status.name) {
        axios.post(webhookUrl, {
          content:
            "<@301969677100515328>, your shitty scraper broke. get rekt.",
        });
      }

      // send a webhook if primal is open
      const behemoth = status.servers.filter((i) => i.name == "Behemoth");
      if (behemoth && behemoth.allowsNewChars) {
        axios.post(webhookUrl, {
          content:
            "<@301969677100515328>, Behemoth is open for new characters! Sign up asap!",
          embeds: [
            {
              title: "Primal Datacenter",
              description: status.servers
                .map((i) => `${i.allowsNewChars ? "🟢" : "🔴"} ${i.name} \n`)
                .join(""),
              url: "https://na.finalfantasyxiv.com/lodestone/worldstatus/",
            },
          ],
        });
      }
    } catch (e) {
      console.error("Issue with webhooks", e.message);
    }
  });
};

check();

/* ++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++ SERVER ++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++ */
app.get("/", (req, res) => {
  res.send("Hello World!!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
