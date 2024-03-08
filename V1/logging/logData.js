const fs = require("fs");
const path = require("path");

function logData(data, fileName) {
  const directory = "./logging/data";

  // Create the directory if it doesn't exist
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  const filePath = path.join(directory, `${fileName}.json`);

  let existingData = [];
  // Check if the file already exists
  if (fs.existsSync(filePath)) {
    // Read the existing JSON data from the file
    const existingJson = fs.readFileSync(filePath, "utf8");

    // Parse the existing JSON data
    try {
      existingData = JSON.parse(existingJson);
    } catch (error) {
      console.error(`Error parsing JSON data: ${error}`);
      return;
    }
  }

  // Append the new data to the existing array
  if (Array.isArray(existingData)) {
    let newData = true;

    if (fileName === "data_viewers") {
      existingData.forEach((item) => {
        if (item.channel === data.channel) {
          if (!Array.isArray(item.viewers)) {
            item.viewers = [item.viewers]; // Convert to array if not already an array
          }
          if (Array.isArray(data.viewers)) {
            // Combine the viewers array if data.viewers is an array
            item.viewers = [...new Set([...item.viewers, ...data.viewers])];
          } else {
            // Add data.viewers to item.viewers array if it's not an array
            item.viewers.push(data.viewers);
          }
          newData = false;
        }
      });
    }

    if (newData) {
      // Add the new data if it's not a duplicate channel
      existingData.push(data);
    }
  } else {
    console.error("Existing data is not an array.");
    return;
  }

  // Sort the existingData array based on the number of viewers
  if (fileName === "data_viewers") {
    existingData.sort((a, b) => {
      const viewersA = Array.isArray(a.viewers) ? a.viewers.length : 0;
      const viewersB = Array.isArray(b.viewers) ? b.viewers.length : 0;
      return viewersB - viewersA; // Sort in descending order
    });
  }

  // Convert the data array to JSON format
  const jsonData = JSON.stringify(existingData, null, 2);

  // Write the JSON data to the file
  fs.writeFileSync(filePath, jsonData, "utf8");

  return;
}

module.exports = logData;
