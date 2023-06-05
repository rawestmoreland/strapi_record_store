'use strict';

const { inventoryImporter } = require("../../../../config/functions/inventoryImporter");

/**
 * A set of functions called "actions" for `inventory`
 */

module.exports = {
  async index(ctx, next) {
    await inventoryImporter();
    ctx.body = 'Hello World!';
  },
};
