const {
  NODE_ENV,
  PORT,
  DISCORD_CLIENT_ID,
  DISCORD_CILENT_SECRET,
  DISCORD_CLIENT_PUBLIC_KEY,
  DISCORD_WEBHOOK_URL,
} = process.env;

const rootURL = "https://ffxiv-status.herokuapp.com";
const env = NODE_ENV || "development";

const environment = {
  port: env === "production" ? PORT : 3000,
  env,
  // domain boiler plate
  apiURL: env === "production" ? rootURL : `http://ffxiv.ngrok.io`,
  // discord
  DISCORD_CLIENT_ID,
  DISCORD_CILENT_SECRET,
  DISCORD_CLIENT_PUBLIC_KEY,
  DISCORD_WEBHOOK_URL,
};

module.exports = environment;
