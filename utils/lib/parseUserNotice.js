function parseUserNotice(parts) {
  let parsedNotice = {};

  const objParts = parts[0].split(";");

  // Iterate through objParts to create key-value pairs
  objParts.forEach((part) => {
    const keyValue = part.split("=");
    const key = keyValue[0];
    let value = keyValue[1];

    do {
      value = value.replace(`\\s`, " ");
    } while (value.includes(`\\s`));

    parsedNotice[key] = value;
  });

  switch (parsedNotice["msg-id"]) {
    case "raid":
    case "announcement":
    case "sub":
    case "resub":
    case "subgift":
    case "submysterygift":
    case "viewermilestone":
    case "unraid":
      parsedNotice.host = parts[1];
      parsedNotice.command = parts[2];
      parsedNotice.channel = parts[3];
      parts[4] ? (parsedNotice.msg = parts.slice(4).join(" ")) : null;
      break;

    default:
      throw new Error("Unable to parse USERNOTICE" + parts);
  }

  return parsedNotice;
}

module.exports = parseUserNotice;
