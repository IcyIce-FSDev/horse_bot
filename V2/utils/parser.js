// Function to parse message
function parser(message) {
  if (message.type !== "utf8") {
    throw new Error(`Cannot parse = ${message}`);
  }

  let parsedMessage = {
    command: [],
  };

  const lines = message.utf8Data
    .split("\r\n")
    .filter((line) => line.trim() !== "");

  lines.forEach((line) => {
    const channelRegex = /(?:^|\s)#\w+/g;
    const channelMatches = line.match(channelRegex);
    if (channelMatches && channelMatches.length > 0) {
      if (!parsedMessage.channel) {
        parsedMessage.channel = [];
      }

      parsedMessage.channel.push(
        ...channelMatches.map((match) => match.trim())
      );
    }

    if (line.includes("PRIVMSG")) {
      parsedMessage.command = ["PRIVMSG"];

      const userRegex = /(?<=:)\w+(?=!)/;
      const userMatch = line.match(userRegex);
      if (userMatch && userMatch.length > 0) {
        parsedMessage.user = userMatch[0].trim();
      }

      const spaceIdx = message.utf8Data.indexOf(" ");
      const rawTagsStr = message.utf8Data.slice(0, spaceIdx);
      const rawTagsArr = rawTagsStr.split(";");

      let newTags = {};

      rawTagsArr.forEach((pair) => {
        const [key, value] = pair.split("=");

        newTags[key] = value;
      });

      parsedMessage.tags = newTags;

      const msgRegex = /PRIVMSG\s#\w+\s:(.*)/;
      const msgMatch = line.match(msgRegex);
      if (msgMatch && msgMatch.length > 1) {
        parsedMessage.msg = msgMatch[1].trim();
      }
    } else if (line.includes("JOIN") || line.includes("PART")) {
      parsedMessage.command = ["JOIN", "PART"];

      const command = line.includes("JOIN") ? "JOIN" : "PART";
      const userRegex = /:(.*?)!/;
      const userMatch = line.match(userRegex);

      if (!parsedMessage.viewers) {
        parsedMessage.viewers = {};
      }

      if (!parsedMessage.viewers[command]) {
        parsedMessage.viewers[command] = [];
      }

      if (userMatch && userMatch.length > 1) {
        const username = userMatch[1];
        parsedMessage.viewers[command].push(username);
      }
    } else if (line.includes("PING")) {
      parsedMessage.command = ["PING"];

      parsedMessage.raw = message.utf8Data;
    } else if (line.includes("GLOBALUSERSTATE")) {
      parsedMessage.command = ["GLOBALUSERSTATE"];

      const spaceIdx = line.indexOf(" ");
      const rawTagsStr = line.slice(1, spaceIdx);
      const rawTagsArr = rawTagsStr.split(";");

      let newTags = {};

      rawTagsArr.forEach((pair) => {
        const [key, value] = pair.split("=");

        newTags[key] = value;
      });

      parsedMessage.tags = newTags;
    } else if (line.includes("ROOMSTATE") || line.includes("USERSTATE")) {
      parsedMessage.command = ["ROOMSTATE", "USERSTATE"];

      const spaceIdx = line.indexOf(" ");
      const rawTagsStr = line.slice(1, spaceIdx);
      const rawTagsArr = rawTagsStr.split(";");

      const state = line.includes("ROOMSTATE") ? "roomState" : "userState";

      let newTags = {
        roomState: {},
        userState: {},
      };

      rawTagsArr.forEach((pair) => {
        const [key, value] = pair.split("=");

        if (line.includes("ROOMSTATE")) {
          newTags.roomState[key] = value;
        } else {
          newTags.userState[key] = value;
        }
      });

      if (parsedMessage.tags && newTags.roomState) {
        parsedMessage.tags.roomState = newTags.roomState;
      } else if (parsedMessage.tags && newTags.userState) {
        parsedMessage.tags.userState = newTags.userState;
      } else {
        parsedMessage.tags = newTags;
      }
    } else if (line.includes("CLEARCHAT")) {
      parsedMessage.command = ["CLEARCHAT"];

      const lastSpaceIdx = line.lastIndexOf(" ");

      const colonIdx = line.indexOf(":", lastSpaceIdx);

      const username = line.slice(colonIdx + 1);

      if (username !== line) {
        parsedMessage.user = username.trim();
      }

      const spaceIdx = line.indexOf(" ");
      const rawTagsStr = line.slice(1, spaceIdx);
      const rawTagsArr = rawTagsStr.split(";");

      let newTags = {};

      rawTagsArr.forEach((pair) => {
        const [key, value] = pair.split("=");

        newTags[key] = value;
      });

      parsedMessage.tags = newTags;
    } else if (line.includes("USERNOTICE")) {
      parsedMessage.command = ["USERNOTICE"];

      const spaceIdx = line.indexOf(" ");
      const rawTagsStr = line.slice(1, spaceIdx);
      const rawTagsArr = rawTagsStr.split(";");

      let newTags = {};

      rawTagsArr.forEach((pair) => {
        const [key, value] = pair.split("=");

        const replacedValue = value.replace(/\\s/g, " ");

        newTags[key] = replacedValue;
      });

      parsedMessage.tags = newTags;
    } else if (line.includes("CLEARMSG")) {
      parsedMessage.command = ["CLEARMSG"];

      const spaceIdx = line.indexOf(" ");
      const rawTagsStr = line.slice(1, spaceIdx);
      const rawTagsArr = rawTagsStr.split(";");

      let newTags = {};

      rawTagsArr.forEach((pair) => {
        const [key, value] = pair.split("=");

        newTags[key] = value;
      });

      parsedMessage.tags = newTags;

      const lastColonIdx = line.lastIndexOf(":");

      parsedMessage.msg = line.slice(lastColonIdx + 1);
    } else if (line.includes("353") || line.includes("366")) {
      parsedMessage.command = ["353", "366"];

      if (line.includes("353")) {
        let users = parsedMessage.viewers ? parsedMessage.viewers : [];

        const lastColonIdx = line.lastIndexOf(":");

        const usersStr = line.slice(lastColonIdx + 1);

        const userArr = usersStr.split(" ");

        if (!Array.isArray(users)) {
          users = [];
        }

        users = users.concat(userArr);

        parsedMessage.viewers = users;
      }
    } else if (line.includes("CAP")) {
      parsedMessage.command = ["CAP"];

      parsedMessage.raw = message.utf8Data;
    }
  });

  if (!parsedMessage.command) return parsedMessage;

  if (parsedMessage.channel) {
    parsedMessage.channel = (() => {
      const filteredArr = parsedMessage.channel.filter(
        (item) => item !== undefined && item !== null
      );

      const uniqueArr = [...new Set(filteredArr)];

      return uniqueArr;
    })();
  }

  parsedMessage.localTime = message.localTime;
  parsedMessage.UTCTime = message.UTCTime;

  return parsedMessage;
}

module.exports = parser;
