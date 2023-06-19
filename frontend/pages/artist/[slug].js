import { useState, useRef } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { footerNavigation, navigation } from '@/constants/navigation';

import Layout from '@/components/Layout';

import axios from 'axios';
import qs from 'qs';
import InfiniteScroll from 'react-infinite-scroll-component';

export async function getServerSideProps({ params, query }) {
  const { slug } = params;
  const { page } = query;

  const artistQuery = qs.stringify({
    fields: ['name'],
    filters: { $and: [{ slug }] },
  });
  const artistResponse = await axios.get(
    `${process.env.STRAPI_API_URL}/artists${artistQuery ? `?${artistQuery}` : ''}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
    },
  );

  const artistName = artistResponse.data.data[0].attributes.name;

  const albumQuery = qs.stringify({
    populate: '*',
    filters: { $and: [{ artist: { name: { $containsi: artistName } } }] },
    pagination: { page, pageSize: 50 },
  });
  const albumsResponse = await axios.get(
    `${process.env.STRAPI_API_URL}/products${albumQuery ? `?${albumQuery}` : ''}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
    },
  );

  const { pagination } = albumsResponse.data.meta;

  const hasMore = pagination.page < pagination.pageCount;

  return {
    props: {
      initialAlbums: albumsResponse.data.data,
      initialPagination: pagination,
      artist: artistResponse.data.data[0],
      initialHasMore: hasMore,
    },
  };
}

export default function Page({ initialAlbums, artist, initialPagination, initialHasMore }) {
  const [albums, setAlbums] = useState(initialAlbums);
  const [pagination, setPagination] = useState(initialPagination);
  const [hasMore, setHasMore] = useState(initialHasMore);

  const observerTarget = useRef();

  const fetchMoreListItems = async (page, hasMore) => {
    console.log(page);
    if (!hasMore) return;

    const albumsQuery = qs.stringify(
      {
        populate: '*',
        pagination: { page, pageSize: 50 },
        filters: {
          $and: [{ artist: { name: { $containsi: artist.attributes.name } } }],
        },
      },
      {
        encodeValuesOnly: true, // prettify URL
      },
    );
    await axios.get(`/api/strapi/albums?${albumsQuery}`).then(res => {
      setAlbums([...albums, ...res.data.data]);
      setPagination(res.data.meta.pagination);
    });
  };

  // useEffect(() => {
  //   const observer = new IntersectionObserver(
  //     entries => {
  //       if (entries[0].isIntersecting) {
  //         const nextPage = pagination.page + 1;
  //         fetchMoreListItems(nextPage, pagination.page < pagination.pageCount);
  //       }
  //     },
  //     { threshold: 1 },
  //   );

  //   if (observerTarget.current) {
  //     observer.observe(observerTarget.current);
  //   }

  //   return () => {
  //     if (observerTarget.current) {
  //       observer.unobserve(observerTarget.current);
  //     }
  //   };
  // }, [observerTarget]);

  return (
    <Layout navigation={navigation} footerNavigation={footerNavigation}>
      <div className="relative mx-auto flex max-w-7xl flex-col gap-5 px-4 py-12 sm:static sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-700">{artist?.attributes?.name}</h1>
        <div className="bg-white">
          <div id="scrollable-list" className="mx-auto max-w-2xl lg:max-w-7xl">
            <h2 className="sr-only">Products</h2>
            <InfiniteScroll
              dataLength={albums.length}
              next={() => fetchMoreListItems(pagination.page + 1, pagination.page < pagination.pageCount)}
              hasMore={pagination.page < pagination.pageCount}
              loader={<h4>Loading...</h4>}
              endMessage={
                <p style={{ textAlign: 'center' }}>
                  <b>Yay! You have seen it all</b>
                </p>
              }
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                {albums?.map(album => {
                  const { attributes } = album;
                  return (
                    <Link key={`${album.id}-${attributes.year}`} href={`/album/${album.id}`} className="group">
                      <div className="w-full overflow-hidden rounded-lg bg-gray-200">
                        <Image
                          width={305}
                          height={305}
                          placeholder="blur"
                          src={attributes.image_a_path}
                          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
                          alt={`${attributes.description}`}
                          className="h-full w-full object-cover object-center group-hover:opacity-75"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <h3 className="mt-4 text-sm font-semibold text-gray-700">
                          {attributes.artist.data.attributes.name} ({attributes.format.data.attributes.name})
                        </h3>
                        <h3 className="text-sm text-gray-700">{attributes.description}</h3>
                      </div>
                      <p className="mt-1 text-lg font-medium text-gray-900">${attributes.price}</p>
                    </Link>
                  );
                })}
                <div ref={observerTarget} />
              </div>
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </Layout>
  );
}
