const targetURL = "https://na.finalfantasyxiv.com/lodestone/worldstatus/";
const axios = require("axios");
const cheerio = require("cheerio");

// scraper
const primalScrape = async () => {
  try {
    // fetch data
    const { data } = await axios.get(targetURL);
    const $ = cheerio.load(data);

    /* ++++++++++++++++++++++++++++++++++++++++++++++ */
    /* ++++++++++++++++ BOILER PLATE ++++++++++++++++ */
    /* ++++++++++++++++++++++++++++++++++++++++++++++ */
    const dataCenterGroupName = (dataCenter) => {
      return $(dataCenter).find("h2").text();
    };

    const serverStatus = (server) => {
      return {
        name: $(server).find(".world-list__world_name p").text(),
        allowsNewChars: !$(server)
          .find(".world-list__create_character i")
          .hasClass("world-ic__unavailable"),
      };
    };

    // create an array of all the servers
    const dataCenterStatus = (dataCenter) => {
      const servers = $(dataCenter).children().find("div.world-list__item");
      let arr = [];
      servers.map((i) => arr.push(serverStatus(servers.get(i))));
      // just a test
      // arr = arr.map((i) =>
      //   i.name == "Behemoth" ? { ...i, allowsNewChars: true } : i
      // );

      const status = {
        name: dataCenterGroupName(dataCenter),
        servers: arr,
      };
      console.log(status);
      return status;
    };

    /* ++++++++++++++++++++++++++++++++++++++++++++++ */
    /* ++++++++++++++++ SCRAPING LOGIC ++++++++++++++++ */
    /* ++++++++++++++++++++++++++++++++++++++++++++++ */
    // identify data centers
    const allDataCenters = $("li.world-dcgroup__item");
    let primal = allDataCenters.get(4);

    // return status object
    return dataCenterStatus(primal);
  } catch (e) {
    console.error("Unable to fetch website for scraping.");
    return {};
  }
};

module.exports = primalScrape;
