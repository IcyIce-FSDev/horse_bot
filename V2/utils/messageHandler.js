const raidAnno = require("./commands/raidAnno");
const sendPong = require("./commands/sendPong");
const logData = require("./tools/logData");
const logUser = require("./tools/logUser");
const parser = require("./tools/parser");

function messageHandler(message, connection, settings, channels) {
  message.UTCTime = new Date().toUTCString();
  message.localTime = new Date().toString();

  let parsedMessage;

  try {
    parsedMessage = parser(message);
  } catch (error) {
    logData([error.message], "data_error_node");
    return;
  }

  if (!parsedMessage.command) {
    logData(message, "data_error");
    return;
  }

  switch (parsedMessage.command[0]) {
    case "USERNOTICE":
      if (parsedMessage.tags["msg-id"] === "raid") {
        raidAnno(parsedMessage, connection);
      }
      break;
    case "PRIVMSG":
      logUser(parsedMessage.user, "users");
      break;
    case "PING":
      sendPong(parsedMessage, connection);
      break;
    case "CAP":
    case "CLEARCHAT":
    case "CLEARMSG":
    case "GLOBALUSERSTATE":
    case "ROOMSTATE":
    case "USERSTATE":
    case "353":
    case "366":
    case "JOIN":
    case "PART":
    case "RECONNECT":
      break;
    default:
      break;
  }

  logData(parsedMessage, "data");

  // End function
  return;
}

module.exports = messageHandler;
