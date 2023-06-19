module.exports = {
  routes: [
    {
      method: "GET",
      path: "/search-artists",
      handler: "search-artists.fuzzySearch",
    },
  ],
};
