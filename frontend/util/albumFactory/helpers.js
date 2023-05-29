async function fetchAllItems(supabase, table, selectString) {
  const limit = 1000;
  let offset = 0;
  let allItems = [];
  let hasMore = true;

  while (hasMore) {
    const { data: itemsBatch, error } = await supabase
      .from(table)
      .select(selectString)
      .range(offset, offset + limit - 1);

    if (error) {
      console.error(`Error fetching ${table}:`, error);
      return null;
    }

    allItems = allItems.concat(itemsBatch);
    offset += limit;
    hasMore = itemsBatch.length === limit;
  }

  return allItems;
}

module.exports = { fetchAllItems };
