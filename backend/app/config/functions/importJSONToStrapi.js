const {
  insertGenres,
  insertLabels,
  insertFormats,
  insertArtists,
} = require("./builders");

async function importJSONToStrapi(strapi, jsonData) {
  let existingAlbums = await strapi.entityService.findMany(
    "api::product.product",
    { populate: "*" }
  );
  if (!existingAlbums) {
    console.error(`Error fetching albums. Exiting...`);
    return;
  }

  const existingAlbumsMap = new Map();
  existingAlbums.forEach((album) => {
    existingAlbumsMap.set(album.item_id, album.id);
  });

  const albumsToInsert = [];
  const albumsToUpdate = [];

  const genres = await insertGenres(strapi, jsonData);
  if (!genres) {
    console.error("Could not fetch genres. Exiting...");
    return;
  }

  const labels = await insertLabels(strapi, jsonData);
  if (!labels) {
    console.error("Could not fetch labels. Exiting...");
    return;
  }

  const artists = await insertArtists(strapi, jsonData);
  if (!artists) {
    console.error("Could not fetch artists. Exiting...");
    return;
  }

  const formats = await insertFormats(strapi, jsonData);
  if (!formats) {
    console.error("Could not fetch formats. Exiting...");
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
    const descriptionArtist = description.split("-").map((da) => da.trim());
    const genresArray = genre
      .split("/")
      .map((g) => g.trim())
      .map((genre) => genresMap.get(genre.toLowerCase()));
    const artistsArray = descriptionArtist[0]
      .map((a) => a.trim())
      .map((artist) => artistsMap.get(artist.toLowerCase()));
    const labelsArray = label
      .split("/")
      .map((l) => l.trim())
      .map((label) => labelsMap.get(label.toLowerCase()));
    const album = {
      item_id,
      artists: artistsArray,
      description: descriptionArtist[1],
      format: formatsMap.get(format.toLowerCase()),
      price,
      sell_price: price + price * 0.1,
      genres: genresArray,
      year,
      labels: labelsArray,
      supplier: 1,
      image_a_path,
      image_b_path,
      upc,
      link,
    };

    albumsData.push(album);
  });

  albumsData.forEach((album) => {
    const stringItemId = album.item_id.toString();
    if (existingAlbumsMap.has(stringItemId)) {
      albumsToUpdate.push({
        ...album,
        id: existingAlbumsMap.get(stringItemId),
      });
      existingAlbumsMap.delete(stringItemId);
    } else {
      albumsToInsert.push(album);
    }
  });

  // Insert new albums
  if (albumsToInsert.length) {
    console.log(`Inserting ${albumsToInsert.length} products.`)
    try {
      for (const product of albumsToInsert) {
        await strapi.entityService.create("api::product.product", {
          data: product,
        });
      }
    } catch (error) {
      console.error("Error inserting albums:", error);
      return;
    }
  }

  // Update existing albums
  if (albumsToUpdate.length) {
    console.log(`Updating ${albumsToUpdate.length} products.`)
    for (const product of albumsToUpdate) {
      await strapi.entityService.update("api::product.product", product.id, {
        data: product,
      });
    }
    if (albumsUpdateError) {
      console.error("Error updating albums:", albumsUpdateError);
      return;
    }
  }

  // Delete albums that are no longer present in the JSON file
  const albumsToDelete = Array.from(existingAlbumsMap.values());
  if (albumsToDelete.length) {
    console.log(`Deleting ${albumsToDelete.length} products.`)
    for (const product of albumsToDelete) {
      await strapi.entityService.delete('api::product.product', product)
    }
    if (albumsDeleteError) {
      console.error('Error deleting albums:', albumsDeleteError);
      return;
    }
  }
}

module.exports = { importJSONToStrapi };
