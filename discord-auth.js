const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const { apiURL } = require("./config");

const { DISCORD_CLIENT_ID, DISCORD_CILENT_SECRET } = process.env;

let root = "http://www.jankpoll.com";

function _encode(obj) {
  let string = "";

  for (const [key, value] of Object.entries(obj)) {
    if (!value) continue;
    string += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }

  return string.substring(1);
}

// auth
const redirect = `${apiURL}/api/auth/discord/callback`;
const scopes = ["identify", "email", "bot", "applications.commands"];

router.get("/", (req, res) => {
  res.redirect(
    `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=379968&scope=${encodeURIComponent(
      scopes.join(" ")
    )}&response_type=code&redirect_uri=${encodeURIComponent(redirect)}`
  );
});

// callback
router.get("/callback", async (req, res) => {
  // extract code from URL
  const { code, guild_id } = req.query;

  try {
    // throw an error if missing a code
    if (!code) throw new Error("Invalid or missing authorization code");

    // perform a request to get token
    const data = {
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CILENT_SECRET,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirect,
    };
    const params = _encode(data);

    const reqUri = `https://discord.com/api/oauth2/token`;
    const response = await fetch(reqUri, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    // convert response to json
    const json = await response.json();

    // use token to fetch user info
    const userDataRes = await fetch("https://discord.com/api/v9/users/@me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${json.access_token}`,
      },
    });
    const userData = await userDataRes.json();

    // save response in db
    if (!json.access_token) throw new Error("No proper access JSON response");

    console.log(`Successfully authed for user ${userDataRes}`);

    // redirect to success
    res.status(200).send(`Successfully added bot to server!`);
  } catch (e) {
    console.error(e.stack, e.message);
    res.status(500).send("Something broke in discord api callback");
  }
});

module.exports = router;
