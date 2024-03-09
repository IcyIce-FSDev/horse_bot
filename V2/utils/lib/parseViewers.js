function parseViewers(rawParametersComponent) {
  if (null == rawParametersComponent) return;

  let parsedViewers = {
    join: [],
    part: [],
  };

  let array = rawParametersComponent.split(`\r\n`);

  array.forEach((string) => {
    let strArr = string.split(" ");

    if (string.includes("JOIN")) {
      strArr.forEach((str) => {
        if (!str) return;

        if (str === "JOIN" || str.startsWith("#")) {
          return;
        }

        const excIndex = str.indexOf("!");

        if (str.startsWith(":") || str.startsWith("#")) {
          parsedViewers.join = [...parsedViewers.join, str.slice(1, excIndex)];
        } else {
          parsedViewers.join = [...parsedViewers.join, str.slice(0, excIndex)];
        }

        // console.log(str);
        return;
      });

      // console.log(parsedViewers);
    }

    if (string.includes("PART")) {
      strArr.forEach((str) => {
        if (!str) return;

        if (str === "PART" || str.startsWith("#")) {
          return;
        }

        const excIndex = str.indexOf("!");

        if (str.startsWith(":") || str.startsWith("#")) {
          parsedViewers.part = [...parsedViewers.part, str.slice(1, excIndex)];
        } else {
          parsedViewers.part = [...parsedViewers.part, str.slice(1, excIndex)];
        }

        // console.log(str);
        return;
      });

      // console.log(parsedViewers);
    }

    return;
  });

  // console.log(parsedViewers);
  return parsedViewers;
}

module.exports = parseViewers;
