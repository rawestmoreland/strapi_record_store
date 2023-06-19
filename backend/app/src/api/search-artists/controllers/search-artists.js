"use strict";
const Fuse = require("fuse.js");

/**
 * A set of functions called "actions" for `search-artists`
 */

module.exports = {
  fuzzySearch: async (ctx) => {
    const searchTerm = ctx.query._search;

    const allArtists = await strapi.entityService.findMany(
      "api::artist.artist"
    );

    const fuse = new Fuse(allArtists, {
      keys: ["name", "slug"],
    });

    const searchedArtists = fuse.search(searchTerm);

    return searchedArtists;
  },
};
