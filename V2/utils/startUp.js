const fs = require("fs");

async function startUp(connection, settings) {
  const directory = "./log";

  // Create the directory if it doesn't exist
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  console.log("Horse_Bot Connected");

  // Send CAP (optional), PASS, and NICK messages for authentication with twitch.
  connection.sendUTF(
    "CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands"
  );
  connection.sendUTF(`PASS ${settings.twitch.password}`);
  connection.sendUTF(`NICK ${settings.twitch.username}`);

  return;
}

module.exports = startUp;
