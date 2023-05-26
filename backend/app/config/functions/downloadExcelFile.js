const axios = require("axios");
const fs = require("fs");

async function downloadExcelFile({
  url = "https://millionsofcds.com/excel/All-inventory.xlsx",
  filePath = `${process.cwd()}/public/static/inventory.xlsx`,
}) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

module.exports = { downloadExcelFile };
