const parseCommand = require("./lib/parseCommand");
const parseSource = require("./lib/parseSource");
const parseTags = require("./lib/parseTags");
const parseParameters = require("./lib/parseParameters");
const parseViewers = require("./lib/parseViewers");

// Function to parse message
function parser(message) {
  if (message.type !== "utf8") {
    throw new Error(`Cannot parse = ${message}`);
  }

  let parsedMessage = {
    // Contains the component parts.
    tags: null,
    source: null,
    commands: null,
    parameters: null,
    UTCTime: message.UTCTime,
  };

  // The start index. Increments as we parse the IRC message.

  let idx = 0;

  // The raw components of the IRC message.

  let rawTagsComponent = null;
  let rawSourceComponent = null;
  let rawCommandComponent = null;
  let rawParametersComponent = null;

  // If the message includes tags, get the tags component of the IRC message.

  if (message.utf8Data[idx] === "@") {
    // The message includes tags.
    let endIdx = message.utf8Data.indexOf(" ");
    rawTagsComponent = message.utf8Data.slice(1, endIdx);
    idx = endIdx + 1; // Should now point to source colon (:).
  }

  // Get the source component (nick and host) of the IRC message.
  // The idx should point to the source part; otherwise, it's a PING command.

  if (message.utf8Data[idx] === ":") {
    idx += 1;
    let endIdx = message.utf8Data.indexOf(" ", idx);
    rawSourceComponent = message.utf8Data.slice(idx, endIdx);
    idx = endIdx + 1; // Should point to the command part of the message.
  }

  // Get the command component of the IRC message.

  let endIdx = message.utf8Data.indexOf(":", idx); // Looking for the parameters part of the message.
  if (-1 == endIdx) {
    // But not all messages include the parameters part.
    endIdx = message.utf8Data.length;
  }

  rawCommandComponent = message.utf8Data.slice(idx, endIdx).trim();

  // Get the parameters component of the IRC message.

  if (endIdx != message.utf8Data.length) {
    // Check if the IRC message contains a parameters component.
    idx = endIdx + 1; // Should point to the parameters part of the message.
    rawParametersComponent = message.utf8Data.slice(idx);
  }

  parsedMessage.commands = parseCommand(rawCommandComponent);

  if (null == parsedMessage.commands) {
    // Is null if it's a message we don't care about.
    return null;
  } else {
    if (null != rawTagsComponent) {
      // The IRC message contains tags.
      parsedMessage.tags = parseTags(rawTagsComponent);
    }

    parsedMessage.source = parseSource(rawSourceComponent);

    parsedMessage.parameters = rawParametersComponent;

    if (rawParametersComponent && rawParametersComponent[0] === "!") {
      // The user entered a bot command in the chat window.

      parsedMessage.commands = parseParameters(
        rawParametersComponent,
        parsedMessage.commands
      );
    }
  }

  if (rawParametersComponent && !rawParametersComponent.includes("353")) {
    if (parsedMessage.commands.command === "PART") {
      parsedMessage.viewers = parseViewers(rawParametersComponent);
    }

    if (parsedMessage.commands.command === "JOIN") {
      parsedMessage.viewers = parseViewers(rawParametersComponent);
    }

    switch (parsedMessage.commands.command) {
      case "JOIN":
      case "PART":
        parsedMessage.commands.command = "JOIN/PART";
        break;

      default:
        break;
    }
  }

  return parsedMessage;
}

module.exports = parser;
