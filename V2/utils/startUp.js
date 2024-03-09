const cleanUp = require("./cleanUp");

let started;

async function startUp(connection, settings) {
  if (!started) {
    // Clean up data logs
    console.log("Performing cleanup...");

    const cleanPerformed = await cleanUp();

    if (!cleanPerformed) {
      console.log("Error in cleanup, shutting down...");
      return false;
    }

    console.log("Done with cleanup...");
    started = true;
  }

  console.log("WebSocket Client Connected");

  // Send CAP (optional), PASS, and NICK messages for authentication with twitch.
  connection.sendUTF(
    "CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands"
  );
  connection.sendUTF(`PASS ${settings.twitch.password}`);
  connection.sendUTF(`NICK ${settings.twitch.username}`);

  return;
}

module.exports = startUp;
