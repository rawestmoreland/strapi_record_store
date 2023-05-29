const slugify = require('slugify');
const jsonData = require('../../public/inventory.json');
const { fetchAllItems } = require('./helpers');
require('dotenv').config();

function getArtistsFromDescription(str) {
  // Split the string at the hyphen to separate the artists from the description
  const [artistsStr] = str.split('-').map((part) => part.trim());

  // Split the artists string at commas to create a list of artists
  const artistsList = artistsStr.map((part) => part.trim());

  // Remove "Etc." from the list of artists
  return artistsList;
}

async function insertGenres(supabase, albums) {
  let uniqueGenres = [
    ...new Set(
      albums
        .map((album) => album.Genre.split('/'))
        .reduce((acc, current) => acc.concat(current)),
      []
    ),
  ];
  const uniqueNameObjects = uniqueGenres.map((str) => ({
    name: str,
    slug: slugify(str, { lower: true, strict: true }),
  }));

  // Insert unique genres into the database
  const { error: insertGenresError } = await supabase
    .from('genres')
    .upsert(uniqueNameObjects, {
      onConflict: 'slug',
      ignoreDuplicates: true,
    });
  if (insertGenresError) {
    console.error('Error inserting genres:', insertGenresError);
    return null;
  }

  // Fetch all genres
  const { data: allGenres, error: allGenresError } = await supabase
    .from('genres')
    .select('*');
  if (allGenresError) {
    console.log('Error fetching all genres:', allGenresError);
    return null;
  }

  return allGenres;
}

async function insertFormats(supabase, albums = jsonData) {
  let uniqueFormatsSet = new Set();

  albums.forEach((album) => {
    uniqueFormatsSet.add(album.Format);
  });

  const uniqueFormatsArray = Array.from(uniqueFormatsSet);

  const uniqueNameObjects = uniqueFormatsArray.map((str) => ({
    name: str,
    slug: slugify(str, { lower: true, strict: true }),
  }));

  // Insert unique genres into the database
  const { error: insertFormatsError } = await supabase
    .from('formats')
    .upsert(uniqueNameObjects, {
      onConflict: 'slug',
      ignoreDuplicates: true,
    });
  if (insertFormatsError) {
    console.error('Error inserting artists:', insertFormatsError);
    return null;
  }

  // Fetch all artists
  const allFormats = await fetchAllItems(supabase, 'formats', 'id, name');

  return allFormats;
}

async function insertArtists(supabase, albums = jsonData) {
  let uniqueArtistsSet = new Set();

  albums.forEach((album) => {
    const artists = getArtistsFromDescription(album.Description);
    artists.forEach((artist) => uniqueArtistsSet.add(artist));
  });

  const uniqueArtistsArray = Array.from(uniqueArtistsSet);

  const uniqueNameObjects = uniqueArtistsArray
    .filter((item) => item !== 'Etc.')
    .map((str) => ({
      name: str,
      slug: slugify(str, { lower: true, strict: true }),
    }));

  // Insert unique genres into the database
  const { error: insertArtistsError } = await supabase
    .from('artists')
    .upsert(uniqueNameObjects, {
      onConflict: 'slug',
      ignoreDuplicates: true,
    });
  if (insertArtistsError) {
    console.error('Error inserting artists:', insertArtistsError);
    return null;
  }

  // Fetch all artists
  const allArtists = await fetchAllItems(supabase, 'artists', 'id, name');

  return allArtists;
}

async function insertLabels(supabase, albums) {
  let uniqueLabelsSet = new Set();

  albums.forEach((album) => {
    const labels = album.Label.split('/').map((l) => l.trim());
    labels.forEach((label) => uniqueLabelsSet.add(label));
  });

  const uniqueLabelsArray = Array.from(uniqueLabelsSet);

  const uniqueNameObjects = uniqueLabelsArray.map((str) => ({
    name: str,
    slug: slugify(str, { lower: true, strict: true }),
  }));

  // Insert unique genres into the database
  const { error: insertLabelsError } = await supabase
    .from('labels')
    .upsert(uniqueNameObjects, {
      onConflict: 'slug',
      ignoreDuplicates: true,
    });
  if (insertLabelsError) {
    console.error('Error inserting artists:', insertLabelsError);
    return null;
  }

  // Fetch all artists
  const allLabels = await fetchAllItems(supabase, 'labels', 'id, name');

  return allLabels;
}

module.exports = { insertGenres, insertArtists, insertFormats, insertLabels };
