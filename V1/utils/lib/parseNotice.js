function parseNotice(parts) {
  let parsedNotice = {};

  parsedNotice.host = parts[1];
  parsedNotice.command = parts[2];
  parsedNotice.channel = parts[3];

  const objParts = parts[0].split(";");

  // Iterate through objParts to create key-value pairs
  objParts.forEach((part) => {
    const keyValue = part.split("=");
    const key = keyValue[0];
    const value = keyValue[1];
    parsedNotice[key] = value;
  });

  parsedNotice.msg = parts.slice(4).join(" ");

  return parsedNotice;
}

module.exports = parseNotice;
