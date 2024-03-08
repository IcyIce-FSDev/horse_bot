function parseCap(parts) {
  const obj = {
    host: "",
    command: "",
    response: "",
    caps: [],
  };

  for (let i = 0; i < parts.length; i++) {
    switch (parts[i]) {
      case ":tmi.twitch.tv":
        obj.host = parts[i];
        break;
      case "CAP":
        obj.command = parts[i];
        break;
      case "ACK":
        obj.response = parts[i];
        break;
      case "NAK":
        obj.response = parts[i];
        break;
      default:
        if (parts[i].includes("twitch.tv/")) {
          obj.caps.push(
            parts[i].startsWith(":") ? parts[i].slice(1) : parts[i]
          );
        }
    }
  }

  return obj;
}

module.exports = parseCap;
