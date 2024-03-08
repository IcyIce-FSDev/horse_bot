// Custom parsers
const parseCap = require("./lib/parseCap");
const parseNum = require("./lib/parseNum");
const parseGUS = require("./lib/parseGUS");
const parseChannel = require("./lib/parseChannel");
const parseState = require("./lib/parseState");
const parsePRIV = require("./lib/parsePRIV");
const parseNotice = require("./lib/parseNotice");
const parseUserNotice = require("./lib/parseUserNotice");
const parseClear = require("./lib/parseClear");

function parseMessage(message) {
  const parsedMessageArray = [];

  const lines = message.utf8Data.split(/\r?\n/);

  for (let line of lines) {
    if (line.trim() === "") continue;

    let spaceSeparatedParts;
    let delimiterSeparatedParts;

    try {
      spaceSeparatedParts = line.split(" ");
    } catch (error) {
      console.log(error);
    }

    try {
      delimiterSeparatedParts = line.split(/[=;, ]+/);
    } catch (error) {
      console.log(error);
    }

    let parsedMessage;

    switch (true) {
      // Finish
      case spaceSeparatedParts.includes("CAP"):
        parsedMessage = parseCap(spaceSeparatedParts);
        break;

      // Finish
      case spaceSeparatedParts.includes("001"):
      case spaceSeparatedParts.includes("002"):
      case spaceSeparatedParts.includes("003"):
      case spaceSeparatedParts.includes("004"):
      case spaceSeparatedParts.includes("375"):
      case spaceSeparatedParts.includes("372"):
      case spaceSeparatedParts.includes("376"):
        parsedMessage = parseNum(spaceSeparatedParts);
        break;

      // Finish
      case spaceSeparatedParts.includes("JOIN"):
      case spaceSeparatedParts.includes("353"):
      case spaceSeparatedParts.includes("366"):
        parsedMessage = parseChannel(spaceSeparatedParts);
        break;

      // Finish
      case spaceSeparatedParts.includes("USERSTATE"):
      case spaceSeparatedParts.includes("ROOMSTATE"):
        parsedMessage = parseState(line);
        break;

      // Finish
      case spaceSeparatedParts.includes("PING"):
        parsedMessage = {
          host: spaceSeparatedParts[1],
          command: spaceSeparatedParts[0],
          rawData: line,
        };
        break;

      // Finish
      case spaceSeparatedParts.includes("PRIVMSG"):
        parsedMessage = parsePRIV(line);
        break;

      // finish
      case spaceSeparatedParts.includes("PART"):
        const excIndex = spaceSeparatedParts[0].indexOf("!");

        parsedMessage = {
          user: spaceSeparatedParts[0].slice(1, excIndex),
          command: "PART",
          channel: spaceSeparatedParts[2],
        };
        break;

      // Finish
      case spaceSeparatedParts.includes("USERNOTICE"):
        parsedMessage = parseUserNotice(spaceSeparatedParts);
        break;

      // Finish
      case spaceSeparatedParts.includes("CLEARMSG"):
      case spaceSeparatedParts.includes("CLEARCHAT"):
        parsedMessage = parseClear(spaceSeparatedParts);
        break;

      // Finish
      case spaceSeparatedParts.includes("NOTICE"):
        parsedMessage = parseNotice(spaceSeparatedParts);
        break;

      // Finish
      case delimiterSeparatedParts.includes("GLOBALUSERSTATE"):
        parsedMessage = parseGUS(line);
        break;

      default:
        throw new Error(message.utf8Data);
    }

    if (parsedMessage) {
      parsedMessageArray.push(parsedMessage);
    }
  }

  return parsedMessageArray;
}

module.exports = parseMessage;
