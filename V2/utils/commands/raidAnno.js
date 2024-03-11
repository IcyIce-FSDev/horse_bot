function raidAnno(message, connection) {
  if (
    !message.channel[0] === "#ira_tate" ||
    !message.channel[0] === "#fistofthehorse"
  )
    return;

  const url = `https://api.twitch.tv/helix/channels?broadcaster_id=${message.tags["user-id"]}`;
  const accessToken = "3d9ye8yar0detagnkou8cqjkyt3n43";
  const clientId = "5qk3819o8iswtantpjnbxeci2xv87t";

  fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": clientId,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      connection.sendUTF(
        `PRIVMSG ${message.channel[0]} :ALERT! ALERT! ${message.tags["display-name"]} is raiding the channel! They are followed by ${message.tags["msg-param-viewerCount"]} viewer(s). Those people were watching ${message.tags["display-name"]} stream ${data.data[0].game_name}. Go follow them at www.twitch.com/${message.tags.login}!`
      );
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

module.exports = raidAnno;