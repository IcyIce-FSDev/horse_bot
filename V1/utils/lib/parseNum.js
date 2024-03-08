function parseNum(parts) {
  const obj = {
    host: parts[0],
    command: parts[1],
    message: parts.slice(2).join(" ").startsWith(":")
      ? parts.slice(3).join(" ")
      : parts.slice(2).join(" "),
  };

  return obj;
}

module.exports = parseNum;
