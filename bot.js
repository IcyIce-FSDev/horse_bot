const WebSocketClient = require("websocket").client; // WS libarary
const fs = require("fs");
const path = require("path");

const parseMessage = require("./utils/parseMessage");
const logData = require("./logging/logData");
const logUser = require("./logging/logUser");
const cleanUp = require("./logging/cleanUp");

const settings = require("./_settings.json");

// Function to load channels from a JSON file or fallback to settings
function loadChannels() {
  const usersJsonPath = "./logging/users/users.json";
  if (fs.existsSync(usersJsonPath)) {
    // Load channels from the JSON file if it exists
    return require(usersJsonPath);
  } else {
    // Fallback to settings.channels if JSON file doesn't exist
    return require("./_settings.json").channels;
  }
}

// Load channels from JSON or settings
const channels = loadChannels();

// Create client instance
const client = new WebSocketClient();

let intervalId; // Define intervalId outside of the event listener

// If error from twitch
client.on("connectFailed", function (error) {
  console.log("Connect Error: " + error.toString());
});

// Define a variable to track the number of batches
let batchesLeft = Math.ceil(channels.length / 20);

// Define a function to join channels in batches
async function joinChannelsBatch(connection) {
  // Take the next 20 channels from the remaining channels array
  const batch = channels.splice(0, 20);

  // Decrement the batchesLeft counter
  batchesLeft--;

  // Format the channels and log before sending the JOIN command
  const formattedChannels = batch.map((channel) => `#${channel}`).join(",");
  connection.sendUTF(`JOIN ${formattedChannels}`);
  console.log("Channels joined.");
  console.log(
    `${batchesLeft} groups of 20 channels left to join. Approx ${Math.round(
      (batchesLeft * 10) / 60
    )} mins left til full start`
  );

  // If there are no more channels, clear the interval
  if (batchesLeft === 0) {
    clearInterval(intervalId);
    console.log("All channels joined.");
    return;
  }
}

// Event listener to initiate connection with twitch
client.on("connect", async function (connection) {
  console.log("Performing cleanup...");

  const cleanPerformed = await cleanUp();

  if (!cleanPerformed) {
    console.log("Error in cleanup, shutting down...");
    return;
  }

  console.log("Done with cleanup...");
  console.log("WebSocket Client Connected");

  // Send CAP (optional), PASS, and NICK messages for authentication with twitch.
  connection.sendUTF(
    "CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands"
  );
  connection.sendUTF(`PASS ${settings.twitch.password}`);
  connection.sendUTF(`NICK ${settings.twitch.username}`);

  // Call the joinChannelsBatch function immediately
  await joinChannelsBatch(connection);

  // Set up an interval to call the joinChannelsBatch function every 15 seconds
  intervalId = setInterval(async () => {
    await joinChannelsBatch(connection);
  }, 15000);

  // Event listener for when message is received after start of connection
  connection.on("message", (message) => {
    message.localTimestamp = new Date().toUTCString();

    logData(message, "data_raw");

    let parsedMessage;

    try {
      parsedMessage = parseMessage(message);
    } catch (error) {
      logData([error.message], "data_error");
      return;
    }

    parsedMessage.forEach((message) => {
      // if (message.command) {
      //   logData(message, "_data_parsed_full");
      // }

      // Disabled for now!
      /* Self replicating feature 
      // if (message.user) {
      //   // Save message.user through function
      //   logUser(message.user, "users");
      // }
      */

      switch (message.command) {
        case "PING":
          const spaceIndex = message.rawData.indexOf(" ");
          const text = message.rawData.slice(spaceIndex + 1);
          connection.sendUTF(`PONG ${text}`);
          logData(message, "data_ping");
          break;

        // case "JOIN":
        //   logData(message, "data_join");
        //   break;

        // case "353":
        //   logData(message, "data_viewers");
        //   break;

        // case "PART":
        //   logData(message, "data_left");
        //   break;

        // case "PRIVMSG":
        //   logData(message, "data_privmsg");
        //   break;

        // case "USERNOTICE":
        //   logData(message, "data_announcements");
        //   break;

        default:
          break;
      }
    });

    // End function
    return;
  });
});

// Starts the connection to twitch
client.connect("ws://irc-ws.chat.twitch.tv:80");
