const csv = require("csv-parser");
const fs = require("fs");

const ObjectsToCsv = require("objects-to-csv");

const readCsv = (path) => {
  return new Promise((resolve, reject) => {
    const results = [];
    try {
      fs.createReadStream(path)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => {
          resolve(results.filter((item) => Object.keys(item).length));
        });
    } catch (error) {
      reject(error);
    }
  });
};
const writeCsv = (path, data) => {
  const csv = new ObjectsToCsv(data);
  return csv.toDisk(path);
};

const deepClone = (object) => {
  return JSON.parse(JSON.stringify(object));
};
const sleep = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
};
module.exports = {
  readCsv,
  writeCsv,
  sleep,
  deepClone,
};
