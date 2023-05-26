const XLSX = require('xlsx');

function convertExcelToJSON(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
  return jsonData;
}

module.exports = { convertExcelToJSON };
