import React, { useCallback } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { debounce } from 'lodash'

import { getProducts, searchProducts } from '../utils/api'

import ProductsList from '../components/ProductsList'

const Home: NextPage = ({ products, page }: any) => {
	const router = useRouter()
	const { meta } = products

	const onSearchChange = useCallback(
		debounce(
			(q: string) =>
				router.replace(
					`${router.pathname}?page=1&search=true&searchQuery=${q}`
				),
			1000
		),
		[]
	)

	const onChange = (e: any) => {
		onSearchChange(e.target.value)
	}

	return (
		<div className=''>
			<Head>
				<title>All Records</title>
			</Head>
			<input onChange={onChange} type='text' />
			<ProductsList products={products} />
			<div className='flex w-full justify-center items-center gap-x-2'>
				<button
					className='border border-black rounded p-2 w-28'
					onClick={() => router.push(`/?page=${page - 1}`)}
					disabled={page <= 1}
				>
					Previous
				</button>
				<span>{`Page ${page} of ${meta.pagination.pageCount}`}</span>
				<button
					className='border border-black rounded p-2 w-28'
					onClick={() => router.push(`/?page=${page + 1}`)}
					disabled={page === meta.pagination.pageCount}
				>
					Next
				</button>
			</div>
		</div>
	)
}

export async function getServerSideProps({
	query: { page = 1, search = false, searchQuery = '' },
}) {
	let products: any = []
	if (search && searchQuery) {
		products = await searchProducts(searchQuery)
	} else {
		products = await getProducts((page = +page), 9)
	}

	return { props: { products, page: +page } }
}

export default Home
