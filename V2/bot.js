// Websocket Client
const WebSocketClient = require("websocket").client;
const fs = require("fs");

// Import settings for twitch
const settings = require("./botSettings.json");
const startUp = require("./utils/startUp");
const messageHandler = require("./utils/messageHandler");

// Create client instance
const client = new WebSocketClient();

// Function to load channels from a JSON file or fallback to settings
function loadChannels() {
  const usersJsonPath = "./utils/logs/users.json";
  if (fs.existsSync(usersJsonPath)) {
    // Load channels from the JSON file if it exists
    return require(usersJsonPath);
  } else {
    // Fallback to settings.channels if JSON file doesn't exist
    return require("./botSettings.json").channels;
  }
}

// Load channels from JSON or settings
const channels = loadChannels();

// Global variables
let intervalId;
let batchesLeft = Math.ceil(channels.length / 20); // Define a variable to track the number of batches

// If error from twitch
client.on("connectFailed", function (error) {
  console.log("Connect Error: " + error.toString());
});

// Event listener to initiate connection with twitch
client.on("connect", async function (connection) {
  // Event listener for when message is received after start of connection
  connection.on("message", (message) => {
    messageHandler(message, connection);
  });

  // Event listener for when the connection is closed by the server
  connection.on("close", function (reasonCode, description) {
    console.log(`Connection closed by server: ${description}`);
    // Optionally, you can attempt to reconnect here
    client.connect("ws://irc-ws.chat.twitch.tv:80");
  });

  // Define a function to join channels in batches
  async function joinChannelsBatch(channels) {
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

  // Starts the bot up
  await startUp(connection, settings);

  // Call the joinChannelsBatch function immediately
  await joinChannelsBatch(channels);

  // Set up an interval to call the joinChannelsBatch function every 15 seconds
  intervalId = setInterval(async () => {
    await joinChannelsBatch(channels);
  }, 15000);
});

// Starts the connection to twitch
client.connect("ws://irc-ws.chat.twitch.tv:80");
