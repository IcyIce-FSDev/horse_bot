const logData = require("./logData");
const logUser = require("./logUser");
const parser = require("./parser");

function messageHandler(message, connection) {
  message.UTCTime = new Date().toUTCString();

  logData(message, "data_raw");

  let parsedMessage;

  try {
    parsedMessage = parser(message);
  } catch (error) {
    logData([error.message], "data_error");
    return;
  }

  logData(parsedMessage, "data_parsed");

  if (!parsedMessage) return;

  switch (parsedMessage.commands.command) {
    case "PING":
      const spaceIndex = message.utf8Data.indexOf(" ");
      const text = message.utf8Data.slice(spaceIndex + 1);
      connection.sendUTF(`PONG ${text}`);
      logData(message, "data_ping");
      break;
    case "PRIVMSG":
      logUser(parsedMessage.tags["display-name"], "users");
      break;
    default:
      break;
  }
  // End function
  return;
}

module.exports = messageHandler;
