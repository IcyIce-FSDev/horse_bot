// Websocket Client
const WebSocketClient = require("websocket").client;
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// Function to save outputs to a text file
function saveOutputToFile(filename, data) {
  const filePath = path.join(__dirname, "log", "data", filename);
  fs.appendFile(filePath, data, (err) => {
    if (err) {
      console.error(`Error saving output to file ${filePath}: ${err.message}`);
    }
  });
}

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

// Redirect stdout and stderr to a file
const outputFilename = "terminal_output.txt";
const errorFilename = "terminal_error.txt";
process.stdout.write = ((write) => {
  return function (string, encoding, fd) {
    saveOutputToFile(outputFilename, string);
    write.apply(process.stdout, arguments);
  };
})(process.stdout.write);

process.stderr.write = ((write) => {
  return function (string, encoding, fd) {
    saveOutputToFile(errorFilename, string);
    write.apply(process.stderr, arguments);
  };
})(process.stderr.write);

// Usage
clearTerminalAndSetTitle("Horse_Bot");

// Import settings for twitch
const settings = require("./botSettings.json");
const startUp = require("./utils/startUp");
const messageHandler = require("./utils/messageHandler");
const cleanUp = require("./utils/cleanUp");

// Load channels from JSON or settings
const channels = require("./botSettings.json").channels;
let newChannels = require("./log/users/users.json");

// Create client instance
const client = new WebSocketClient();

// Global variables
let intervalId;
let batchesLeft = Math.ceil(newChannels.length / 20); // Define a variable to track the number of batches

const cleanPerformed = cleanUp();

setTimeout(() => {
  // Clean up data logs

  console.log("Performing cleanup...");

  if (!cleanPerformed) {
    console.log("Error in cleanup, shutting down...");
    return false;
  }

  console.log("Done with cleanup...");
}, 100);

setTimeout(() => {
  // If error from twitch
  client.on("connectFailed", function (error) {
    console.log("Connect Error: " + error.toString());
  });

  // Event listener to initiate connection with twitch
  client.on("connect", async function (connection) {
    // Define a function to join channels in batches
    async function joinChannelsBatch(channelsArr) {
      if (channelsArr.length < 20) {
        // Format the channels and log before sending the JOIN command
        const channelBatch = channelsArr
          .map((channel) => `#${channel}`)
          .join(",");
        connection.sendUTF(`JOIN ${channelBatch}`);
        clearInterval(intervalId);
        console.log("All channels joined from initial settings");
        // console.log(
        //   "Will check if additional channels need loading from self-replication in 10 seconds"
        // );
        return;
      }

      // Take the next 20 channels from the remaining channels array
      const batch = channelsArr.splice(0, 20);

      // Format the channels and log before sending the JOIN command
      const formattedChannels = batch.map((channel) => `#${channel}`).join(",");

      // Decrement the batchesLeft counter
      batchesLeft--;

      connection.sendUTF(`JOIN ${formattedChannels}`);
      console.log(`Joining additional channels at ${new Date().toUTCString()}`);
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
    // if (newChannels.length > 20) {
    //   // Set up an interval to call the joinChannelsBatch function every 15 seconds
    //   intervalId = setInterval(async () => {
    //     await joinChannelsBatch(newChannels);
    //   }, 10000);
    // }

    // Event listener for when message is received after start of connection
    connection.on("message", (message) => {
      messageHandler(message, connection, settings, channels);
    });

    // Event listener for when the connection is closed by the server
    connection.on("close", async function () {
      // Get new channel list
      newChannels = require("./log/users/users.json");

      // Attempt to reconnect here
      client.connect("ws://irc-ws.chat.twitch.tv:80");

      // Starts the bot up
      await startUp(connection, settings);

      // Call the joinChannelsBatch function immediately
      await joinChannelsBatch(channels);

      //   // Set up an interval to call the joinChannelsBatch function every 15 seconds
      //   intervalId = setInterval(async () => {
      //     await joinChannelsBatch(newChannels);
      //   }, 10000);
    });
  });

  // Starts the connection to twitch
  client.connect("ws://irc-ws.chat.twitch.tv:80");
}, 300);
