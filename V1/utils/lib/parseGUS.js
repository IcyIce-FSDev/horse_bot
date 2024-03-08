function parseGUS(rawData) {
  const parsedData = {
    "Badge-info": "",
    Badges: "",
    Color: "",
    "Display name": "",
    "Emote-sets": "",
    Turbo: "",
    "User-id": "",
    "User-type": "",
  };

  // Split the raw data into key-value pairs
  const keyValuePairs = rawData.split(";");

  // Loop through each key-value pair and assign values to the corresponding keys
  keyValuePairs.forEach((pair) => {
    const [key, value] = pair.split("=");

    switch (key) {
      case "@badge-info":
        parsedData["Badge-info"] = value;
        break;
      case "badges":
        parsedData["Badges"] = value;
        break;
      case "color":
        parsedData["Color"] = value;
        break;
      case "display-name":
        parsedData["Display name"] = value;
        break;
      case "emote-sets":
        parsedData["Emote-sets"] = value;
        break;
      case "user-id":
        parsedData["User-id"] = value;
        break;
      case "user-type":
        parsedData["User-type"] = value;
        break;
      default:
        break;
    }
  });

  return parsedData;
}

module.exports = parseGUS;
