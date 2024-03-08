// Websocket Client
const WebSocketClient = require("websocket").client;

// Import settings for twitch
const settings = require("./utils/_settings.json");

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

// Global variables
let intervalId; // Define intervalId outside of the event listener

// If error from twitch
client.on("connectFailed", function (error) {
  console.log("Connect Error: " + error.toString());
});
