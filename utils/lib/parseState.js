function parseState(data) {
  // Remove the '@' symbol and split the line by semicolons
  const parts = data.slice(1).split(";");

  // Initialize an object to store the parsed data
  const parsedData = {
    host: "",
    command: "",
    channel: "",
  };

  // Go through parts and assign key/values to parsedData from each string until last string
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    // Split each part into key and value based on the first occurrence of '='
    const index = part.indexOf("=");
    if (index !== -1) {
      const key = part.slice(0, index);
      const value = part.slice(index + 1);
      // Assign the key-value pair to the parsed data object
      parsedData[key] = value;
    }
  }

  // Find the last string of parts
  const lastString = parts[parts.length - 1];

  // Parse last string into array of strings separated by space
  const arrStrings = lastString.split(" ");

  // Add arrStrings[0] as a key/value pair to parsedData
  const keyValueArr = arrStrings[0].split("=");
  parsedData[keyValueArr[0]] = keyValueArr[1] || "";

  // Find ROOMSTATE or USERSTATE in the array
  const stateIndex = arrStrings.findIndex(
    (str) => str === "ROOMSTATE" || str === "USERSTATE"
  );

  // Assign to command and set host to ':tmi.twitch.tv'
  if (stateIndex !== -1) {
    parsedData.command = arrStrings[stateIndex];
    // Find string from arrStrings that starts with # and assign to channel
    const channelString = arrStrings.find((str) => str.startsWith("#"));
    if (channelString) {
      parsedData.channel = channelString;
    }
  }

  // Find string starting with ':tmi' and assign to host
  const tmiString = arrStrings.find((str) => str.startsWith(":tmi"));
  if (tmiString) {
    parsedData.host = tmiString;
  }

  return parsedData;
}

module.exports = parseState;
