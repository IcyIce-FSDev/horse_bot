function parsePRIV(message) {
  const parts = message.split(" ");

  const keyValuePairs = {};
  // Extract key-value pairs from the first part
  const keyValue = parts[0].split(";");
  for (const pair of keyValue) {
    const [key, value] = pair.split("=");
    keyValuePairs[key] = value;
  }

  const excIndex = parts[1].indexOf("!");

  const user = parts[1].slice(1, excIndex);
  const command = parts[2];
  const channel = parts[3];
  const messageText = parts.slice(4).join(" ");

  // Construct the result object with all key-value pairs
  const result = {
    command: command,
    channel: channel,
    user: user,
    userInfo: { ...keyValuePairs },
    message: messageText.slice(1).trim(),
  };

  return result;
}

module.exports = parsePRIV;
