const nacl = require("tweetnacl");
const { DISCORD_CLIENT_PUBLIC_KEY } = require("./config");

const runVerification = (req, res) => {
  try {
    const signature = req.get("X-Signature-Ed25519");
    const timestamp = req.get("X-Signature-Timestamp");
    const rawBody = JSON.stringify(req.body); // rawBody is expected to be a string, not raw bytes

    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + rawBody),
      Buffer.from(signature, "hex"),
      Buffer.from(DISCORD_CLIENT_PUBLIC_KEY, "hex")
    );
    if (!isVerified) {
      console.log("Failed verification");
      return res.status(401).end("invalid request signature");
    }
  } catch (e) {
    console.error(e.message);
    return res.send("Error handling verification");
  }

  // test request
  const pingType = req.body.type;
  if (pingType && pingType === 1) {
    console.log("Handling validation test request", pingType);
    return res.status(200).send({ type: 1 });
  }
};

const verificationCheck = (req, res, next) => {
  runVerification(req, res);
  next();
};

module.exports = { verificationCheck, runVerification };
