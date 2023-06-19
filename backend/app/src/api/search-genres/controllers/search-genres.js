"use strict";
const Fuse = require("fuse.js");

/**
 * A set of functions called "actions" for `search-artists`
 */

module.exports = {
  fuzzySearch: async (ctx) => {
    const searchTerm = ctx.query._search;

    const allGenres = await strapi.entityService.findMany("api::genre.genre");

    console.log(allGenres);

    const fuse = new Fuse(allGenres, {
      includeScore: true,
      keys: ["name", "slug"],
    });

    const searchedGenres = fuse.search(searchTerm);

    return searchedGenres;
  },
};
