const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const { convertExcelToJSON } = require('./convertExcelToJSON');
const { importJSONToSupabase } = require('./importJSONToPostgres');

async function downloadExcelFile({
  url = 'https://millionsofcds.com/excel/All-inventory.xlsx',
  filePath,
}) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  );

  const excelFilePath = path.resolve(__dirname, '../../public/inventory.xlsx');
  const outputJsonFilePath = path.resolve(
    __dirname,
    '../../public/inventory.json'
  );

  // Download the excel file
  await downloadExcelFile({ filePath: excelFilePath });
  console.log('Excel file has been downloaded and saved to', excelFilePath);

  // Convert the Excel data to JSON and save it to a file
  const jsonData = convertExcelToJSON(excelFilePath);
  await fs.promises.writeFile(
    outputJsonFilePath,
    JSON.stringify(jsonData, null, 2)
  );
  console.log(
    'Excel data has been converted to JSON and saved to',
    outputJsonFilePath
  );

  // Import the JSON data into the Supabase database
  await importJSONToSupabase(supabase, jsonData);
  console.log('JSON data has been imported into the Supabase database.');
}

main().catch(console.error);
