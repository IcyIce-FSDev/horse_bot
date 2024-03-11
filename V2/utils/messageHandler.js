const sendPong = require("../commands/sendPong");
const logData = require("./logData");
const logUser = require("./logUser");
const parser = require("./parser");

function messageHandler(message, connection) {
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
      logData(parsedMessage, "data_cap");
      break;
    case "CLEARCHAT":
      logData(parsedMessage, "data_clearchat");
      break;
    case "CLEARMSG":
      logData(parsedMessage, "data_clearmsg");
      break;
    case "PING":
      sendPong(parsedMessage, connection);
      logData(parsedMessage, "data_ping");
      break;
    case "PRIVMSG":
      logData(parsedMessage, "data_privmsg");
      logUser(parsedMessage.user, "users");
      break;
    case "GLOBALUSERSTATE":
    case "ROOMSTATE":
    case "USERSTATE":
      logData(parsedMessage, "data_state");
      break;
    case "USERNOTICE":
      logData(parsedMessage, "data_usernotice");
      break;
    case "353":
    case "366":
      logData(parsedMessage, "data_viewers");
      break;
    case "JOIN":
    case "PART":
      logData(parsedMessage, "data_viewers_join_part");
      break;
    default:
      break;
  }

  logData(parsedMessage, "_data");
  // End function
  return;
}

module.exports = messageHandler;
