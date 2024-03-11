const raidAnno = require("./commands/raidAnno");
const sendPong = require("./commands/sendPong");
const logData = require("./logData");
const logUser = require("./logUser");
const parser = require("./parser");

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
    case "CAP":
    case "CLEARCHAT":
    case "CLEARMSG":
    case "PING":
      break;
    case "PRIVMSG":
      logUser(parsedMessage.user, "users");
      break;
    case "GLOBALUSERSTATE":
    case "ROOMSTATE":
    case "USERSTATE":
    case "USERNOTICE":
      if (parsedMessage.tags["msg-id"] === "raid") {
        raidAnno(parsedMessage, connection);
      }
      break;
    case "353":
    case "366":
    case "JOIN":
    case "PART":
    case "RECONNECT":
      break;
    default:
      break;
  }

  // End function
  return;
}

module.exports = messageHandler;
