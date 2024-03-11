const fs = require("fs").promises; // Import promises version of fs
const path = require("path");
const directory = "./log/data";

async function cleanUp() {
  // Create the directory if it doesn't exist
  try {
    await fs.mkdir(directory); // Use async version of mkdir
  } catch (error) {
    if (error.code !== "EEXIST") {
      console.error("Error creating directory:", error);
      return false;
    }
  }

  try {
    // If the directory exists, delete all files in it
    const files = await fs.readdir(directory); // Use async version of readdir
    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(directory, file);
        await fs.unlink(filePath); // Use async version of unlink
      })
    );

    return true;
  } catch (error) {
    console.error("Error deleting files:", error);
    return false;
  }
}

module.exports = cleanUp;
