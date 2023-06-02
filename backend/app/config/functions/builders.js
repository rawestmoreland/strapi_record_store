function getArtistsFromDescription(str) {
  // Split the string at the hyphen to separate the artists from the description
  const artistsStr = str.split('-').map((part) => part.trim());

  return artistsStr;
}

async function insertGenres(strapi, albums) {
  let uniqueGenres = [
    ...new Set(
      albums
        .map((album) => album.Genre.split("/"))
        .reduce((acc, current) => acc.concat(current)),
      []
    ),
  ];
  const uniqueNameObjects = uniqueGenres.map((str) => ({
    name: str,
  }));
  // Insert unique genres into the database
  for (const unique of uniqueNameObjects) {
    try {
      const genre = await strapi.db.query("api::genre.genre").findOne({
        where: { name: unique.name },
      });
      if (!genre) {
        const newGenre = await strapi.entityService.create("api::genre.genre", {
          data: unique,
        });
      } else continue;
    } catch (error) {
      console.error("Error inserting genres:", error);
      return null;
    }
  }

  const genres = await strapi.entityService.findMany('api::genre.genre');

  console.log("Finished writing genres.");
  return genres;
}

async function insertFormats(strapi, albums) {
  let uniqueFormatsSet = new Set();

  albums.forEach((album) => {
    uniqueFormatsSet.add(album.Format);
  });

  const uniqueFormatsArray = Array.from(uniqueFormatsSet);

  const uniqueNameObjects = uniqueFormatsArray.map((str) => ({
    name: str,
  }));

  // Insert unique genres into the database
  for (const unique of uniqueNameObjects) {
    try {
      const format = await strapi.db.query("api::format.format").findOne({
        where: { name: unique.name },
      });
      if (!format) {
        const newFormat = await strapi.entityService.create(
          "api::format.format",
          {
            data: unique,
          }
        );
      } else continue;
    } catch (error) {
      console.error("Error inserting formats:", error);
      return null;
    }
  }

  const formats = await strapi.entityService.findMany('api::format.format');

  console.log("Finished writing formats.");
  return formats;
}

async function insertLabels(strapi, albums) {
  let uniqueLabelsSet = new Set();

  albums.forEach((album) => {
    const labels = album.Label.split("/").map((l) => l.trim());
    labels.forEach((label) => uniqueLabelsSet.add(label));
  });

  const uniqueLabelsArray = Array.from(uniqueLabelsSet);

  const uniqueNameObjects = uniqueLabelsArray.map((str) => ({
    name: str,
  }));

  // Insert unique genres into the database
  for (const unique of uniqueNameObjects) {
    try {
      const label = await strapi.db.query("api::label.label").findOne({
        where: { name: unique.name },
      });
      if (!label) {
        const newLabel = await strapi.entityService.create("api::label.label", {
          data: unique,
        });
      } else continue;
    } catch (error) {
      console.error("Error inserting labels:", error);
      return null;
    }
  }

  const labels = await strapi.entityService.findMany('api::label.label');

  console.log("Finished writing labels.");
  return labels;
}

async function insertArtists(strapi, albums) {
  let uniqueArtistsSet = new Set();

  albums.forEach((album) => {
    const artists = getArtistsFromDescription(album.Description);
    artists.forEach((artist) => uniqueArtistsSet.add(artist));
  });

  const uniqueArtistsArray = Array.from(uniqueArtistsSet);

  const uniqueNameObjects = uniqueArtistsArray
    .filter((item) => item !== "Etc.")
    .map((str) => ({
      name: str,
    }));

  // Insert unique genres into the database
  for (const unique of uniqueNameObjects) {
    try {
      const artist = await strapi.db.query("api::artist.artist").findOne({
        where: { name: unique.name },
      });
      if (!artist) {
        const newArtist = await strapi.entityService.create(
          "api::artist.artist",
          {
            data: unique,
          }
        );
      } else continue;
    } catch (error) {
      console.error("Error inserting artists:", error);
      return null;
    }
  }

  const artists = await strapi.entityService.findMany('api::artist.artist');

  console.log("Finished writing artists.");
  return artists;
}

module.exports = { insertGenres, insertLabels, insertFormats, insertArtists };
