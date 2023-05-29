const https = require('https');
const fs = require('fs');
const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_API_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const url = 'https://millionsofcds.com/excel/All-inventory.xlsx';

function downloadInventory() {
  const path = './public/inventory.xlsx';
  https.get(url, (response) => {
    const writeStream = fs.createWriteStream(path);
    response.pipe(writeStream);

    writeStream.on('finish', () => {
      writeStream.close();
      xlsxToJson();
    });
  });
}

function xlsxToJson() {
  const file = xlsx.readFile('./public/inventory.xlsx');

  const sheetNames = file.SheetNames;
  const totalSheets = sheetNames.length;

  let parsedData = [];

  for (let i = 0; i < totalSheets; i++) {
    const tempData = xlsx.utils.sheet_to_json(file.Sheets[sheetNames[i]]);

    tempData.shift();

    parsedData.push(...tempData);

    generateJSONFile(parsedData);
  }
}

function generateJSONFile(data) {
  try {
    fs.writeFile(
      './public/inventory.json',
      JSON.stringify(data),
      async (err, fd) => {
        if (err) {
          console.error(err);
          throw new Error(err);
        } else {
          console.log('JSON file written');
          await updateDatabase();
        }
      }
    );
  } catch (error) {
    console.error(error);
  }
}

async function buildGenreList(albums) {
  let uniqueGenres = [
    ...new Set(
      albums
        .map((album) => album.Genre.split('/'))
        .reduce((acc, current) => acc.concat(current)),
      []
    ),
  ];
  const uniqueNameObjects = uniqueGenres.map((str) => ({ name: str }));
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Genres');
      resolve(uniqueNameObjects);
    }, 2000);
  });
}

async function buildFormatList(albums) {
  let uniqueFormats = [
    ...new Set(
      albums.map((album) => album.Format),
      []
    ),
  ];
  const uniqueNameObjects = uniqueFormats.map((str) => ({ name: str }));
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Formats');
      resolve(uniqueNameObjects);
    }, 2000);
  });
}

async function buildLabelList(albums) {
  let uniqueLabels = [
    ...new Set(
      albums
        .map((album) => album.Label.split('/'))
        .reduce((acc, current) => acc.concat(current)),
      []
    ),
  ];
  const uniqueNameObjects = uniqueLabels.map((str) => ({ name: str }));
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Labels');
      resolve(uniqueNameObjects);
    }, 2000);
  });
}

async function buildArtistList(albums) {
  let uniqueArtists = [
    ...new Set(
      albums
        .map((album) => album.Description.split('-'))
        .reduce((acc, current) => acc.concat(current[0].trim())),
      []
    ),
  ];
  const uniqueNameObjects = uniqueArtists.map((str) => ({ name: str }));
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Artists');
      resolve(uniqueNameObjects);
    }, 2000);
  });
}

async function buildAlbumList(albums) {
  let objects = albums.map((a) => ({
    id: a.ItemID,
    format: a.Format,
    price: a.Price,
    artist: a.Description.split('-')[0].trim().split(','),
    description: a.Description.split('-')[1].trim(),
    label: a.Label.split('/'),
    upc: a.UPC,
    year: a.Year,
    imageAPath: a.ImageAPath,
    imageBPath: a.ImageBPath,
    link: a.Link,
    genre: a.Genre.split('/'),
  }));
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Albums');
      resolve(objects);
    }, 2000);
  });
}

async function upsertIntoSupabase(table, data, uniqueColumn) {
  return supabase
    .from(table)
    .upsert(data, { onConflict: uniqueColumn, ignoreDuplicates: true })
    .select()
    .then(({ data, error }) => {
      if (error) {
        throw error;
      }
      return data;
    })
    .catch((error) => console.error(`Error inserting data:`, error));
}

async function updateDatabase() {
  const data = await supabase.rpc('delete_albums').then(async () => {
    return await new Promise((resolve, reject) => {
      resolve(
        fs.readFile(
          './public/inventory.json',
          'utf8',
          async (error, albums) => {
            const genreList = await buildGenreList(JSON.parse(albums));

            const artistList = await buildArtistList(JSON.parse(albums));

            const formatList = await buildFormatList(JSON.parse(albums));

            const labelList = await buildLabelList(JSON.parse(albums));

            const albumList = await buildAlbumList(JSON.parse(albums));

            const valuesToInsert = [
              { table: 'labels', data: labelList, unique: 'name' },
              { table: 'formats', data: formatList, unique: 'name' },
              { table: 'genres', data: genreList, unique: 'name' },
              { table: 'albums', data: albumList, unique: 'upc' },
              { table: 'artists', data: artistList, unique: 'name' },
            ];

            const upsertPromises = valuesToInsert.map((value) =>
              upsertIntoSupabase(value.table, value.data, value.unique)
            );

            const results = await Promise.all(upsertPromises).then(
              async (data) => {
                const albums = await supabase.from('albums').select('genre');
                return data;
              }
            );
            return results;
          }
        )
      );
    });
  });

  return data;
}

async function main() {
  downloadInventory();
}

main();
