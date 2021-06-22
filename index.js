var getPixels = require("get-pixels");
const utils = require("./utils");
var cd = require("color-difference");

const fs = require("fs");

const NUM_OF_PIXELS = 30;
function getDataFromImage(image) {
  return new Promise((resolve, reject) => {
    getPixels("images/" + image, function (err, pixels) {
      if (err) {
        console.log("Bad image path");
        return;
      }
      const width = pixels.shape[0];
      const height = pixels.shape[1];
      if (width <= 30 || height <= 30) reject("Image dimension not satisfied");
      const color2D = [];
      for (var i = 0; i < height; i++) {
        const colorRow = [];
        for (var j = 0; j < width; j++) {
          const r = pixels.get(j, i, 0).toString(16);
          const g = pixels.get(j, i, 1).toString(16);
          const b = pixels.get(j, i, 2).toString(16);
          const a = pixels.get(j, i, 3).toString(16);
          colorRow.push(`#${r}${g}${b}`);
        }
        color2D.push(colorRow);
      }

      const midX = Math.floor(width / 2);
      const midY = Math.floor(height / 2);
      const horizontalLeap = Math.floor(width / NUM_OF_PIXELS);
      const verticalLeap = Math.floor(height / NUM_OF_PIXELS);

      const verticalColors = [];
      const horizontalColors = [];
      for (
        let x = midX - Math.ceil(NUM_OF_PIXELS / 2) * horizontalLeap;
        x < midX + Math.floor(NUM_OF_PIXELS / 2) * horizontalLeap;
        x += horizontalLeap
      ) {
        horizontalColors.push(color2D[midY][x]);
      }
      for (
        let y = midY - Math.ceil(NUM_OF_PIXELS / 2) * verticalLeap;
        y < midY + Math.floor(NUM_OF_PIXELS / 2) * verticalLeap;
        y += verticalLeap
      ) {
        verticalColors.push(color2D[y][midX]);
      }
      //   console.log(horizontalColors.length, verticalColors.length);
      const h_relativeDistinctColors = [];
      const v_relativeDistinctColors = [];

      for (let i = 0; i < horizontalColors.length; i++) {
        if (
          !h_relativeDistinctColors.find(
            (item) => cd.compare(item, horizontalColors[i]) < 0.5
          )
        ) {
          h_relativeDistinctColors.push(horizontalColors[i]);
        }
      }
      for (let i = 0; i < verticalColors.length; i++) {
        if (
          !v_relativeDistinctColors.find(
            (item) => cd.compare(item, verticalColors[i]) < 0.5
          )
        ) {
          v_relativeDistinctColors.push(verticalColors[i]);
        } else {
          //   console.log(
          //     "example",
          //     v_relativeDistinctColors.find((item) =>
          //       cd.compare(item, verticalColors[i])
          //     ),
          //     verticalColors[i]
          //   );
        }
      }
      resolve({
        image,
        result: Math.max(
          h_relativeDistinctColors.length,
          v_relativeDistinctColors.length
        ),
        horizontalColors,
        verticalColors,
        v_relativeDistinctColors,
        h_relativeDistinctColors,
        oh_Num: horizontalColors.length,
        ov_Num: verticalColors.length,
        h_Num: h_relativeDistinctColors.length,
        v_Num: v_relativeDistinctColors.length,
      });
    });
  });
}

async function run() {
  const data = utils.deepClone(
    fs.readdirSync("images").map((item) => ({
      image: item,
    }))
  );
  const results = [];
  for (let i = 0; i < data.length; i++) {
    console.log("Working on", data[i]);
    try {
      const res = await getDataFromImage(data[i].image);
      results.push(res);
    } catch (e) {
      results.push(data[i]);
    }
    utils.writeCsv("output.csv", results);
  }
}

run();
