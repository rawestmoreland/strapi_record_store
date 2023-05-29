import { useRef } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import qs from 'qs';

import { navigation, footerNavigation } from '@/constants/navigation';
import ReactPaginate from 'react-paginate';

const PAGE_SIZE = 50;

export async function getServerSideProps(context) {
  const page = context.query.page || 1;

  const queryString = qs.stringify({
    pagination: { page, pageSize: PAGE_SIZE },
    sort: ['name'],
    filters: { name: { $ne: '' } },
  });

  try {
    const genres = await axios.get(`${process.env.STRAPI_API_URL}/genres${queryString ? `?${queryString}` : ''}`, {
      headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` },
    });
    return {
      props: {
        genres: genres.data.data,
        pagination: genres.data.meta.pagination,
      },
    };
  } catch (error) {
    console.error(error);
    return { props: null };
  }
}

export default function Page({ genres, pagination }) {
  const timeoutId = useRef(null);

  const router = useRouter();

  const handlePageClick = data => {
    let selected = data.selected + 1; // react-paginate uses zero-based index, increment by 1 for our API
    router.push(`/genres?page=${selected}`);
  };

  return (
    <Layout navigation={navigation} footerNavigation={footerNavigation}>
      <div className="relative mx-auto flex max-w-7xl flex-col gap-5 px-4 py-12 text-gray-700 sm:static sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Genres</h1>

        {/* <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        /> */}

        <div className="grid grid-cols-5 items-center gap-4">
          {genres?.map(genre => (
            <div key={genre.attributes.id} className="text-gray-700">
              <Link href={`/genre/${genre.attributes.slug}`}>{genre.attributes.name}</Link>
            </div>
          ))}
        </div>
      </div>

      <ReactPaginate
        containerClassName="flex flex-row gap-4 w-full justify-center items-center text-gray-700"
        previousLabel={'Prev'}
        nextLabel={'Next'}
        breakLabel={'...'}
        initialPage={pagination?.page - 1}
        pageCount={pagination?.pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        previousClassName="underline"
        nextClassName="underline"
        activeClassName="font-bold text-lg underline"
      />
    </Layout>
  );
}
