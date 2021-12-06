/* ++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++ 3RD PARTY ++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++ */
const express = require("express");
const app = express();
const axios = require("axios");
const cron = require("node-cron");

/* ++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++ CUSTOM IMPORTS ++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++ */
const { port, env, DISCORD_WEBHOOK_URL } = require("./config");
const primalScrape = require("./scraper");
const { runVerification } = require("./verificationCheck");

/* ++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++ UTILITIES ++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++ */
const composeDataCenterStatusEmbed = (status) => {
  return {
    title: `${status.name}`,
    description: status.servers
      .map((i) => `${i.allowsNewChars ? "🟢" : "🔴"} ${i.name} \n`)
      .join(""),
    url: "https://na.finalfantasyxiv.com/lodestone/worldstatus/",
  };
};

/* ++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++ CRON JOB ++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++ */

const check = () => {
  console.log("Starting the cron job");
  cron.schedule("*/15 * * * * *", async () => {
    // get latest server status
    const status = await primalScrape();

    try {
      // if error
      if (!status.name) {
        axios.post(DISCORD_WEBHOOK_URL, {
          content:
            "<@301969677100515328>, your shitty scraper broke. get rekt.",
        });
      }

      // send a webhook if primal is open
      const behemoth = status.servers.filter((i) => i.name == "Behemoth")[0];
      if (behemoth && behemoth.allowsNewChars) {
        axios.post(DISCORD_WEBHOOK_URL, {
          content:
            "<@301969677100515328>, Behemoth is open for new characters! Sign up asap!",
          embeds: [composeDataCenterStatusEmbed(status)],
        });
      }
    } catch (e) {
      console.error("Issue with webhooks", e.message);
    }
  });
};

check();

/* ++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++ SERVER MIDDLEWARE ++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++ */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  if (env === "development") {
    const msg = [
      `+++++++++++++++++++++++++++++++++++++++++++++`,
      `${req.method}: ${req.baseUrl}${req.path}`,
      `query:`,
      req.query,
      `params:`,
      req.params,
      `body:`,
      req.body,
    ];
    console.log(msg);
  }
  next();
});

/* ++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++ RESTFUL ENDPOINTS ++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++ */

app.use("/auth/discord/", require("./discord-auth"));

app.post("/interactions/", async (req, res) => {
  // verification first
  runVerification(req, res);

  try {
    //fetch data
    const status = await primalScrape();

    // logic
    res.send({
      type: 4,
      data: {
        embeds: [composeDataCenterStatusEmbed(status)],
      },
    });
  } catch (e) {
    console.error(e.message);
    res.send({
      type: 4,
      data: {
        content: e.message,
      },
    });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
