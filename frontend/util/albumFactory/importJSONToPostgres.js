const {
  insertGenres,
  insertArtists,
  insertFormats,
  insertLabels,
} = require('./builders');
const { fetchAllItems } = require('./helpers');
require('dotenv').config();

async function importJSONToPostgres(supabase, jsonData) {
  let existingAlbums;

  existingAlbums = await fetchAllItems(supabase, 'albums', 'id, item_id');
  if (!existingAlbums) {
    console.error(`Error fetchnig albums. Exiting...`);
    return;
  }

  const existingAlbumsMap = new Map();
  existingAlbums.forEach((album) => {
    existingAlbumsMap.set(album.item_id, album.id);
  });

  const albumsToInsert = [];
  const albumsToUpdate = [];

  const genres = await insertGenres(supabase, jsonData);
  if (!genres) {
    console.error('Could not fetch genres. Exiting...');
    return;
  }

  const labels = await insertLabels(supabase, jsonData);
  if (!labels) {
    console.error('Could not fetch labels. Exiting...');
    return;
  }

  const artists = await insertArtists(supabase, jsonData);
  if (!artists) {
    console.error('Could not fetch artists. Exiting...');
    return;
  }

  const formats = await insertFormats(supabase, jsonData);
  if (!formats) {
    console.error('Could not fetch formats. Exiting...');
    return;
  }

  const labelsMap = new Map();
  labels.forEach((label) => {
    labelsMap.set(label.name.toLowerCase(), label.id);
  });

  const genresMap = new Map();
  genres.forEach((genre) => {
    genresMap.set(genre.name.toLowerCase(), genre.id);
  });

  const artistsMap = new Map();
  artists.forEach((artist) => {
    artistsMap.set(artist.name.toLowerCase(), artist.id);
  });

  const formatsMap = new Map();
  formats.forEach((format) => {
    formatsMap.set(format.name.toLowerCase(), format.id);
  });

  const albumsData = [];
  const albumGenresData = [];
  const albumLabelsData = [];
  const albumArtistsData = [];
  const albumFormatsData = [];

  // Prepare albumsData and albumGenresData
  jsonData.forEach((record) => {
    const {
      Description: description,
      Format: format,
      UPC: upc,
      ItemID: item_id,
      Genre: genre,
      Year: year,
      Label: label,
      ImageAPath: image_a_path,
      ImageBPath: image_b_path,
      Link: link,
      Price: price,
    } = record;
    const descriptionArtist = description.split('-').map((da) => da.trim());
    const genresArray = genre.split('/').map((g) => g.trim());
    const artistsArray = descriptionArtist[0].map((a) => a.trim());
    const labelsArray = label.split('/').map((l) => l.trim());
    const album = {
      item_id,
      artist: artistsArray,
      description: descriptionArtist[1],
      format,
      price,
      genre: genresArray,
      year,
      label: labelsArray,
      image_a_path,
      image_b_path,
      upc,
      link,
    };

    albumsData.push(album);

    genresArray.forEach((genreName) => {
      const genreId = genresMap.get(genreName.toLowerCase());
      if (genreId) {
        albumGenresData.push({
          album_id: item_id, // This will be replaced by the actual album id after insertion
          genre_id: genreId,
        });
      }
    });

    labelsArray.forEach((labelName) => {
      const labelId = labelsMap.get(labelName.toLowerCase());
      if (labelId) {
        albumLabelsData.push({
          album_id: item_id, // This will be replaced by the actual album id after insertion
          label_id: labelId,
        });
      }
    });

    artistsArray.forEach((artistName) => {
      const artistId = artistsMap.get(artistName.toLowerCase());
      if (artistId) {
        albumArtistsData.push({
          album_id: item_id, // This will be replaced by the actual album id after insertion
          artist_id: artistId,
        });
      }
    });

    const formatId = formatsMap.get(format);
    if (formatId) {
      albumFormatsData.push({
        album_id: item_id,
        format_id: formatId,
      });
    }
  });

  albumsData.forEach((album) => {
    if (existingAlbumsMap.has(album.item_id)) {
      albumsToUpdate.push({
        ...album,
        id: existingAlbumsMap.get(album.item_id),
      });
      existingAlbumsMap.delete(album.item_id);
    } else {
      albumsToInsert.push(album);
    }
  });

  // Insert new albums
  if (albumsToInsert.length) {
    const { error: albumsInsertError } = await supabase
      .from('albums')
      .insert(albumsToInsert)
      .select();
    if (albumsInsertError) {
      console.error('Error inserting albums:', albumsInsertError);
      return;
    }
  }

  // Update existing albums
  if (albumsToUpdate.length) {
    const { error: albumsUpdateError } = await supabase
      .from('albums')
      .upsert(albumsToUpdate)
      .select();
    if (albumsUpdateError) {
      console.error('Error updating albums:', albumsUpdateError);
      return;
    }
  }

  // Delete albums that are no longer present in the JSON file
  const albumsToDelete = Array.from(existingAlbumsMap.values());
  if (albumsToDelete.length) {
    const { error: albumsDeleteError } = await supabase
      .from('albums')
      .delete()
      .in('id', albumsToDelete);

    if (albumsDeleteError) {
      console.error('Error deleting albums:', albumsDeleteError);
      return;
    }
  }

  // Fetch all albums again
  existingAlbums = await fetchAllItems(supabase, 'albums', 'id, item_id');

  // Replace the item_id with the actual album id in albumGenresData
  const albumsMap = new Map();
  existingAlbums.forEach((album) => {
    albumsMap.set(album.item_id, album.id);
  });

  albumGenresData.forEach((relationship) => {
    relationship.album_id = albumsMap.get(relationship.album_id);
  });

  albumLabelsData.forEach((relationship) => {
    relationship.album_id = albumsMap.get(relationship.album_id);
  });

  albumArtistsData.forEach((relationship) => {
    relationship.album_id = albumsMap.get(relationship.album_id);
  });

  albumFormatsData.forEach((relationship) => {
    relationship.album_id = albumsMap.get(relationship.album_id);
  });

  // Insert albumFormatsData
  const { error: albumFormatsInsertError } = await supabase
    .from('formats_albums_links')
    .upsert(albumFormatsData, {
      onConflict: 'album_id, format_id',
      ignoreDuplicates: true,
    });

  if (albumFormatsInsertError) {
    console.error(
      'Error inserting album-format relationships:',
      albumFormatsInsertError
    );
    return;
  }

  // Insert albumGenresData
  const { error: albumGenresInsertError } = await supabase
    .from('genres_albums_links')
    .upsert(albumGenresData, {
      onConflict: 'album_id, genre_id',
      ignoreDuplicates: true,
    });

  if (albumGenresInsertError) {
    console.error(
      'Error inserting album-genre relationships:',
      albumGenresInsertError
    );
    return;
  }

  // Insert albumLabelsData
  const { error: albumLabelsInsertError } = await supabase
    .from('labels_albums_links')
    .upsert(albumLabelsData, {
      onConflict: 'album_id, label_id',
      ignoreDuplicates: true,
    });

  if (albumLabelsInsertError) {
    console.error(
      'Error inserting album-label relationships:',
      albumLabelsInsertError
    );
    return;
  }

  // Insert albumArtistData
  const { error: albumArtistsInsertError } = await supabase
    .from('artists_albums_links')
    .upsert(albumArtistsData, {
      onConflict: 'album_id, artist_id',
      ignoreDuplicates: true,
    });

  if (albumArtistsInsertError) {
    console.error(
      'Error inserting album-artist relationships:',
      albumArtistsInsertError
    );
    return;
  }
}

module.exports = { importJSONToSupabase: importJSONToPostgres };
