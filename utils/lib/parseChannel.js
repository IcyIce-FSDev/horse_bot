function parseChannel(data) {
  let parsedData = {
    host: "",
    command: "",
    channel: "",
    // viewers: [], if command is 353
  };

  switch (true) {
    case data.includes("JOIN"):
      const hostRegex = /:(.*?)!/; // Regular expression to match the username between : and !
      const hostMatch = data.toString().match(hostRegex); // Convert data to string and then apply match

      parsedData.host = hostMatch ? hostMatch[1] : data[0]; // Use extracted username if match found, otherwise use the original host
      parsedData.command = data[data.indexOf("JOIN")];
      parsedData.channel = data.find(
        (entry) => typeof entry === "string" && entry.startsWith("#")
      );
      break;

    case data.includes("353"):
      parsedData.host = data[0];
      parsedData.command = data[data.indexOf("353")];
      parsedData.channel = data.find(
        (entry) => typeof entry === "string" && entry.startsWith("#")
      );

      const viewerStartIndex = data.indexOf("=");

      parsedData.viewers = data.slice(viewerStartIndex + 1); // Need to be array of users, starts at the first string starting with : after the channel
      break;

    case data.includes("366"):
      parsedData.host = data[0];
      parsedData.command = data[data.indexOf("366")];
      parsedData.channel = data.find(
        (entry) => typeof entry === "string" && entry.startsWith("#")
      );
      break;

    default:
      break;
  }

  return parsedData;
}

module.exports = parseChannel;
