function sendPong(parsedMessage, connection) {
  const spaceIndex = parsedMessage.raw.indexOf(" ");
  const text = parsedMessage.raw.slice(spaceIndex + 1);
  connection.sendUTF(`PONG ${text}`);

  console.log(`Sent pong at ${parsedMessage.localTime}`);
  return;
}

module.exports = sendPong;
