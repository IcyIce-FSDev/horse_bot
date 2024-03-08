const fs = require("fs");
const path = require("path");

function logUser(data, fileName) {
  const directory = "./logging/users";

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

  // Check if the data already exists in the array
  const found = existingData.includes(data);

  // If the data doesn't exist, append it to the existing array
  if (!found) {
    existingData.push(data);

    existingData.sort();

    // Convert the data array to JSON format
    const jsonData = JSON.stringify(existingData, null, 2);

    // Write the JSON data to the file
    fs.writeFileSync(filePath, jsonData, "utf8");
  }

  return;
}

module.exports = logUser;
