function parseClear(parts) {
  let parsedClear = {};

  parsedClear.host = parts[1];
  parsedClear.command = parts[2];
  parsedClear.channel = parts[3];

  if (parsedClear.command === "CLEARCHAT") parsedClear.user = parts[4];

  if (parsedClear.command === "CLEARMSG")
    parsedClear.msg = parts.slice(4).join(" ");

  const objParts = parts[0].split(";");

  // Iterate through objParts to create key-value pairs
  objParts.forEach((part) => {
    const keyValue = part.split("=");
    const key = keyValue[0];
    let value = keyValue[1];

    do {
      value = value.replace(`\\s`, " ");
    } while (value.includes(`\\s`));

    parsedClear[key] = value;
  });

  return parsedClear;
}

module.exports = parseClear;
