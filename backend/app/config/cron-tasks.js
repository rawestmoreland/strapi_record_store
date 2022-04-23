const reader = require("xlsx");
const { createWriteStream } = require("fs");
const fetch = require("node-fetch");
const { takeCoverage } = require("v8");
const { format } = require("path");

module.exports = {
  /**
   * Every day at 3:30 AM
   */
  "*/30 * * * *": async ({ strapi }) => {
    console.log("getting inventory");
    const inventoryUrl =
      "https://www.millionsofcds.com/excel/All-Inventory.xls";

    async function download(url, path) {
      console.log("Downloading new inventory...");
      const res = await fetch(url);

      if (!res.ok) {
        console.log("error");
        throw new Error(`unexpected response while downloading inventory`);
      }

      const fileStream = createWriteStream(path);

      await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on("error", reject);
        fileStream.on("finish", resolve);
      });
    }

    async function parse(path) {
      console.log("Parsing new inventory...");
      const file = reader.readFile(`${process.cwd()}${path}`);

      let data = [];

      const sheets = file.SheetNames;

      for (let i = 0; i < sheets.length; i++) {
        const temp = reader.utils.sheet_to_json(
          file.Sheets[file.SheetNames[i]]
        );

        temp.forEach((res) => {
          data.push(res);
        });
      }

      return data;
    }

    /**
     *
     * @returns A list of product item_ids from the database
     */
    async function getStrapiData(type) {
      const data = await strapi.db
        .query(`api::${type}.${type}`)
        .findMany({ populate: true });
      return data;
    }

    /**
     *
     * @param {*} data - A list of objects parsed from the spreadhseet
     * @returns a list if item ids
     */
    async function getItemIdsFromData(data, oldData = false) {
      let ids = [];
      let idKey = oldData ? "item_id" : "ItemID";
      data.forEach((d) => {
        ids.push(Number.parseInt(d[idKey]));
      });
      return ids;
    }

    async function getGenreNames(data, fromExcel = false) {
      let names = [];
      let genreKey = fromExcel ? "Genre" : "genre";
      data.forEach((d) => {
        names.push(d[genreKey]);
      });
      return names;
    }

    async function getFormatNames(data, fromExcel = false) {
      let names = [];
      let formatKey = fromExcel ? "Format" : "format";
      data.forEach((d) => {
        names.push(d[formatKey]);
      });
      return names;
    }

    /**
     * Remove the ids from the DB that aren't in the newest
     * version of the inventory sheet.
     *
     * Update items that are in both new and old data
     *
     * @param {*} oldData - Data from Strapi
     * @param {*} newIds - Data from the new spreadsheet
     *
     * @return - a list of new ids to be used for the create
     */
    async function updateStaleProducts(oldData, newData, formats, genres) {
      console.log("UPDATING STALE PRODUCTS");
      let removeIds = [];
      let newDataIds = await getItemIdsFromData(newData);
      let uniqueNewData = newData;
      let updateCount = 0;
      for (let item of oldData) {
        let { item_id } = item;
        item_id = Number.parseInt(item_id);
        /**
         * If we see a match on ids - perform an update.
         * Else push to list of ids to be removed.
         */
        if (newDataIds.includes(item_id)) {
          const newDataIndex = newData.findIndex((object) => {
            return object.ItemID === item_id;
          });
          const updateData = newData[newDataIndex];
          let genreList = [];
          updateData.Genre &&
            updateData.Genre.split("/").forEach((genre) => {
              const genreIndex = genres.findIndex((object) => {
                return genre === object.genre;
              });
              genreList.push(genres[genreIndex].id);
            });
          const formatIndex = formats.findIndex((object) => {
            return updateData.Format === object.format;
          });
          console.log("UPDATING ITEM: ", item_id);
          await strapi.db.query("api::product.product").update({
            where: {
              item_id,
            },
            data: {
              link: updateData.Link,
              item_id: updateData.ItemID,
              price: updateData.Price,
              description: updateData.Description,
              year: updateData.Year,
              label: updateData.Label,
              upc: updateData.UPC,
              genres: genreList,
              format: formats[formatIndex].id,
              catalog: updateData.Catalog,
              image_a_path: updateData.ImageAPath,
              image_b_path: updateData.ImageBPath,
            },
          });
          updateCount++;
          const indexOfObject = uniqueNewData.findIndex((object) => {
            return object.ItemID === item_id;
          });
          uniqueNewData.splice(indexOfObject, 1);
        } else {
          removeIds.push(item.id);
        }
      }
      console.log("Remove Product Count: ", removeIds.length);
      if (removeIds.length) {
        removeIds.forEach(async (id) => {
          await strapi.db.query("api::product.product").delete({
            where: {
              item_id: id,
            },
          });
        });
      }
      console.log("Updated product count: ", updateCount);
      return uniqueNewData;
    }

    async function getUniqueGenres(oldGenres, newData) {
      let oldGenreNames = await getGenreNames(oldGenres, false);
      let newGenreNames = await parseGenres(newData);
      let uniqueNewGenres = [
        ...new Set([...oldGenreNames, ...newGenreNames]),
      ].filter((i) => !oldGenreNames.includes(i));
      return uniqueNewGenres;
    }

    async function getUniqueFormats(oldFormats, newData) {
      let oldFormatNames = await getFormatNames(oldFormats);
      let newFormatNames = await parseFormats(newData);
      let uniqueNewFormats = [
        ...new Set([...oldFormatNames, ...newFormatNames]),
      ].filter((i) => !oldFormatNames.includes(i));
      return uniqueNewFormats;
    }

    /**
     * Split each 'genre' on forward slashed to get a list of
     * individual genre names.
     *
     * @param {*} data - Genre column
     *
     * @returns a list of genres
     */
    async function parseGenres(data) {
      let genreList = [];

      data.forEach((item) => {
        if (item.Genre) {
          let splitGenres = item.Genre.split("/");
          splitGenres.forEach((g) => {
            if (genreList.includes(g)) {
              return;
            }
            genreList.push(g);
          });
        }
      });
      return genreList;
    }

    async function parseFormats(data) {
      let formatList = [];

      data.forEach((item) => {
        if (item.Format) {
          if (formatList.includes(item.Format)) {
            return;
          }
          formatList.push(item.Format);
        }
      });
      return formatList;
    }

    download(inventoryUrl, `${process.cwd()}/public/static/inventory.xls`)
      .then(() => parse("/public/static/inventory.xls"))
      .then(async (newData) => {
        console.log("NEW DATA COUNT: ", newData.length);
        // Get the ids we have in the DB
        const oldData = await getStrapiData("product");
        console.log("OLD DATA COUNT (IN STRAPI): ", oldData.length);
        // genres from the DB
        let genres = await getStrapiData("genre");
        let formats = await getStrapiData("format");
        const uniqueNewGenres = await getUniqueGenres(genres, newData);
        uniqueNewGenres.length &&
          uniqueNewGenres.forEach(async (genre) => {
            await strapi.db.query("api::genre.genre").create({
              data: {
                genre,
              },
            });
          });
        const uniqueNewFormats = await getUniqueFormats(formats, newData);
        uniqueNewFormats.length &&
          uniqueNewFormats.forEach(async (format) => {
            await strapi.db.query("api::format.format").create({
              data: {
                format,
              },
            });
          });

        /**
         * Re-fetch the updated formats and genres
         */
        formats = await getStrapiData("format");
        genres = await getStrapiData("genre");

        /**
         * Update the ids we have in the DB compared to the spreadsheet.
         * uniqueNewData is a list of products that need to be created.
         */
        const uniqueNewData = await updateStaleProducts(
          oldData,
          newData,
          formats,
          genres
        );

        console.log("New entries to add: ", uniqueNewData.length);

        uniqueNewData.length &&
          uniqueNewData.forEach(async (item) => {
            let genreList = [];
            item.Genre &&
              item.Genre.split("/").forEach((genre) => {
                const genreIndex = genres.findIndex((object) => {
                  return genre === object.genre;
                });
                genreList.push(genres[genreIndex].id);
              });
            const formatIndex = formats.findIndex((object) => {
              return item.Format === object.format;
            });
            const upCharge = item.Price * 0.5;
            await strapi.db
              .query("api::product.product")
              .create({
                data: {
                  supplier: 1,
                  link: item.Link,
                  item_id: item.ItemID,
                  format: formats[formatIndex].id,
                  price: item.Price,
                  sell_price: item.Price + upCharge,
                  description: item.Description,
                  year: item.Year,
                  label: item.Label,
                  upc: item.UPC,
                  catalog: item.Catalog,
                  genres: genreList,
                  image_a_path: item.ImageAPath,
                  image_b_path: item.ImageBPath,
                },
              })
              .then(() => console.log("finished"));
          });
      });
  },
};
