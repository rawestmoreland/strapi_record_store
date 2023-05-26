module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    data.slug = await strapi
      .service("plugin::content-manager.uid")
      .generateUIDField({
        contentTypeUID: "api::genre.genre",
        field: "slug",
        data,
      });
  },
};
