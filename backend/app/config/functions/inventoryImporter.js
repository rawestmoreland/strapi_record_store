const { downloadExcelFile } = require("./downloadExcelFile");
const { convertExcelToJSON } = require("./convertExcelToJSON");
const { importJSONToStrapi } = require("./importJSONToStrapi");
const fs = require('fs');

async function inventoryImporter(inventoryUrl = "https://www.millionsofcds.com/excel/All-Inventory.xlsx", excelFilePath = `${process.cwd()}/public/static/inventory.xlsx`, outputJsonFilePath = `${process.cwd()}/public/static/inventory.json`) {
  await downloadExcelFile({
    url: inventoryUrl,
    filePath: excelFilePath,
  });
  console.log(
    `Excel data has been dowloaded and saved to ${excelFilePath}`
  );

  const jsonData = convertExcelToJSON(excelFilePath);
  await fs.promises.writeFile(
    outputJsonFilePath,
    JSON.stringify(jsonData, null, 2)
  );
  console.log(
    "Excel data has been converted to JSON and saved to",
    outputJsonFilePath
  );

  await importJSONToStrapi(strapi, jsonData);

  console.log('All done 😃');
}

module.exports = { inventoryImporter }