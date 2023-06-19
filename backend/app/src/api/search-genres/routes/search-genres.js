module.exports = {
  routes: [
    {
      method: "GET",
      path: "/search-genres",
      handler: "search-genres.fuzzySearch",
    },
  ],
};
