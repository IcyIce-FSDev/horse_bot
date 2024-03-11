// Websocket Client
const WebSocketClient = require("websocket").client;
const { exec } = require("child_process");

async function clearTerminalAndSetTitle(newTitle) {
  // Clear the terminal using Clear-Host command in PowerShell
  exec(`powershell.exe -Command "& {Clear-Host}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error clearing terminal: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error clearing terminal: ${stderr}`);
      return;
    }
    // Set the window title using .NET in PowerShell
    exec(
      `powershell.exe -Command "& {$host.ui.RawUI.WindowTitle='${newTitle}' }"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error setting window title: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Error setting window title: ${stderr}`);
          return;
        }
      }
    );
  });
}

// Usage
clearTerminalAndSetTitle("Horse_Bot");

// Import settings for twitch
const settings = require("./botSettings.json");
const startUp = require("./utils/startUp");
const messageHandler = require("./utils/messageHandler");

// Load channels from JSON or settings
const channels = require("./botSettings.json").channels;

// Create client instance
const client = new WebSocketClient();

// Global variables
let intervalId;
let batchesLeft = Math.ceil(channels.length / 20); // Define a variable to track the number of batches

// If error from twitch
client.on("connectFailed", function (error) {
  console.log("Connect Error: " + error.toString());
});

// Event listener to initiate connection with twitch
client.on("connect", async function (connection) {
  // Define a function to join channels in batches
  async function joinChannelsBatch(channels) {
    if (channels.length < 20) {
      // Format the channels and log before sending the JOIN command
      const channelBatch = channels.map((channel) => `#${channel}`).join(",");
      connection.sendUTF(`JOIN ${channelBatch}`);
      clearInterval(intervalId);
      console.log("All channels joined.");
      return;
    }

    // Take the next 20 channels from the remaining channels array
    const batch = channels.splice(0, 20);

    // Format the channels and log before sending the JOIN command
    const formattedChannels = batch.map((channel) => `#${channel}`).join(",");

    // Decrement the batchesLeft counter
    batchesLeft--;

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

  // If batching needed, sets intervel
  if (channels.length > 20) {
    // Set up an interval to call the joinChannelsBatch function every 15 seconds
    intervalId = setInterval(async () => {
      await joinChannelsBatch(channels);
    }, 15000);
  }

  // Event listener for when message is received after start of connection
  connection.on("message", (message) => {
    messageHandler(message, connection, settings, channels);
  });

  // Event listener for when the connection is closed by the server
  connection.on("close", async function () {
    // Attempt to reconnect here
    client.connect("ws://irc-ws.chat.twitch.tv:80");

    // Starts the bot up
    await startUp(connection, settings);

    // Call the joinChannelsBatch function immediately
    await joinChannelsBatch(channels);

    // Set up an interval to call the joinChannelsBatch function every 15 seconds
    intervalId = setInterval(async () => {
      await joinChannelsBatch(channels);
    }, 15000);
  });
});

// Starts the connection to twitch
client.connect("ws://irc-ws.chat.twitch.tv:80");
