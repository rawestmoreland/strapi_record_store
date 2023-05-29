import getSupabaseClientInstance from './supabaseClient';

export async function fetchAlbumsByGenre(genre, page = 1, limit = 50) {
  const supabase = getSupabaseClientInstance();

  const { data, error, count } = await supabase
    .from('albums')
    .select('*, genres_albums_links!inner (album_id, genre_id)', {
      count: 'exact',
    })
    .filter('genres_albums_links.genre_id', 'eq', genre.id)
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    console.error('Error fetching albums', error);
    return [];
  }

  return { albums: data, total: count };
}
