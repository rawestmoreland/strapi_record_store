const { createClient } = require('@supabase/supabase-js');
const slugify = require('slugify');
require('dotenv').config();

const url = process.env.SUPABASE_API_URL;
const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function fetchGenres(supabase) {
  const { data: genres, error } = await supabase
    .from('genres')
    .select('name, id');

  if (error) {
    return null;
  }

  return genres;
}

async function main() {
  const supabase = createClient(url, apiKey);

  const genres = await fetchGenres(supabase);

  if (!genres) {
    console.error('Unable to fetch genres. Exiting...');
    return;
  }

  genres.forEach(async (genre) => {
    const { error } = await supabase
      .from('genres')
      .upsert(
        { slug: slugify(genre.name, { lower: true, strict: true }) },
        { onConflict: 'slug', ignoreDuplicates: true }
      )
      .eq('id', genre.id);
    if (error) {
      console.error('Encountered an error while inserting.', error);
      return;
    }
  });
}

main().catch((error) => console.error(error));
