import { useRef, useEffect, useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import qs from 'qs';

import { navigation, footerNavigation } from '@/constants/navigation';
import ReactPaginate from 'react-paginate';

import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';

import classNames from '@/functions/classNames';
import { debounce } from 'lodash';

const PAGE_SIZE = 50;

export async function getServerSideProps(context) {
  const page = context.query.page || 1;

  let artists = [];
  let pagination = {};

  const queryString = qs.stringify({
    pagination: { page, pageSize: PAGE_SIZE },
    sort: ['name'],
    filters: { name: { $ne: '' } },
  });

  try {
    const artistResults = await axios.get(
      `${process.env.STRAPI_API_URL}/artists${queryString ? `?${queryString}` : ''}`,
      {
        headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` },
      },
    );
    artists = artistResults.data.data;
    pagination = artistResults.data.meta.pagination;
  } catch (error) {
    console.error(error);
    return { props: null };
  }

  return {
    props: {
      artists,
      pagination,
    },
  };
}

export default function Page({ artists, pagination }) {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handlePageClick = data => {
    let selected = data.selected + 1; // react-paginate uses zero-based index, increment by 1 for our API
    router.push(`/artists?page=${selected}`);
  };

  const handleUserInput = async e => {
    setSearch(e.target.value);
    setSearchResults([]);
    setLoading(true);
    const response = await axios.get(`/api/strapi/fuzzy-search/artists?_search=${e.target.value}`);
    setSearchResults(response.data);
    setLoading(false);
  };

  const debouncedUserInput = useCallback(debounce(handleUserInput, 500), []);

  useEffect(() => {
    return () => {
      debouncedUserInput.cancel();
    };
  }, []);

  if (!artists && !pagination) {
    return <div />;
  }

  return (
    <Layout navigation={navigation} footerNavigation={footerNavigation}>
      <div className="relative mx-auto flex max-w-7xl flex-col gap-5 px-4 py-12 text-gray-700 sm:static sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Artists</h1>

        <Combobox as="div" value={null} onChange={() => {}}>
          <Combobox.Label className="block text-sm font-medium leading-6 text-gray-900">Search Artists</Combobox.Label>
          <div className="relative mt-2">
            <Combobox.Input
              className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              onChange={debouncedUserInput}
              displayValue={artist => artist?.item?.name}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </Combobox.Button>

            {loading && (
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                <Combobox.Option className="relative flex cursor-default select-none justify-center py-2 pl-3 pr-9 font-bold text-gray-900">
                  <span>Loading...</span>
                </Combobox.Option>
              </Combobox.Options>
            )}

            {searchResults.length > 0 && (
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {searchResults.map(artist => (
                  <Combobox.Option
                    key={artist.item.id}
                    value={artist.item.slug}
                    className={({ active }) =>
                      classNames(
                        'relative cursor-default select-none py-2 pl-3 pr-9',
                        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                      )
                    }
                  >
                    {({ active, selected }) => (
                      <>
                        <Link
                          className={classNames('block truncate', selected && 'font-semibold')}
                          href={`/artist/${artist.item.slug}`}
                        >
                          {artist.item.name}
                        </Link>

                        {selected && (
                          <span
                            className={classNames(
                              'absolute inset-y-0 right-0 flex items-center pr-4',
                              active ? 'text-white' : 'text-indigo-600',
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            )}
          </div>
        </Combobox>

        <div className="grid grid-cols-5 items-center gap-4">
          {artists?.map(artist => {
            const name = artist.item?.name || artist.attributes.name;
            const slug = artist.item?.slug || artist.attributes.slug;
            return (
              <div key={artist.id} className="text-gray-700">
                <Link href={`/artist/${slug}`}>{name}</Link>
              </div>
            );
          })}
        </div>
      </div>

      {pagination && (
        <ReactPaginate
          containerClassName="flex flex-row gap-4 w-full justify-center items-center text-gray-700"
          previousLabel={'Prev'}
          nextLabel={'Next'}
          breakLabel={'...'}
          initialPage={pagination.page - 1}
          pageCount={pagination.pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          previousClassName="underline"
          nextClassName="underline"
          activeClassName="font-bold text-lg underline"
        />
      )}
    </Layout>
  );
}
