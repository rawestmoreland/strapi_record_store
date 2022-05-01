import React, { useCallback } from 'react'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { debounce, omit, toUpper } from 'lodash'

import { getProducts, searchProducts } from '../utils/api'

import ProductsList from '../components/ProductsList'
import { Product } from '../utils/types'
import { extraParamsFromRouterQuery } from '../utils/helpers'

const Home: NextPage = ({ products, page }: any) => {
	const router = useRouter()
	const { meta } = products

	const onSearchChange = useCallback(
		debounce((q: string, queries: any) => {
			console.log(queries)
			const extraParams = extraParamsFromRouterQuery(
				omit(queries, ['page', 'searchQuery'])
			)
			console.log(extraParams)
			return router.replace(
				`${router.pathname}?page=1&searchQuery=${q}${extraParams}`
			)
		}, 1000),
		[]
	)

	const onPageSizeChange = useCallback((value: any, queries: any) => {
		console.log(queries)
		const extraParams = extraParamsFromRouterQuery(
			omit(queries, ['pageSize'])
		)
		console.log(extraParams)
		return router.replace(
			`${router.pathname}?pageSize=${value}${extraParams}`
		)
	}, [])

	const onChange = (e: any) => {
		onSearchChange(e.target.value, router.query)
	}

	const onDropDownChange = (e: any) => {
		onPageSizeChange(e.target.value, router.query)
	}

	return (
		<div className=''>
			<Head>
				<title>All Records</title>
			</Head>
			<div className='flex flex-col md:flex-row'>
				<input
					placeholder='Search anything'
					className='ml-6 mt-2 h-8 px-2'
					onChange={onChange}
					type='text'
				/>
				<div className='flex flex-row'>
					<select
						onChange={onDropDownChange}
						name='pageSize'
						id='pageSize'
						value={router.query.pageSize || 10}
						placeholder={`${
							router.query.pageSize || 10
						} products per page`}
						className='ml-6 mt-2 h-8'
					>
						<option value='5'>5</option>
						<option value='10'>10</option>
						<option value='25'>25</option>
						<option value='100'>100</option>
					</select>
					<label
						className='flex items-center ml-4 mt-2'
						htmlFor='pageSize'
					>
						Products Per Page
					</label>
				</div>
			</div>
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
					onClick={() =>
						router.push(
							`/?page=${page + 1}${
								router.query.search ? '&search=true' : ''
							}${
								router.query.searchQuery
									? '&searchQuery=' + router.query.searchQuery
									: ''
							}`
						)
					}
					disabled={page === meta.pagination.pageCount}
				>
					Next
				</button>
			</div>
		</div>
	)
}

export const getServerSideProps: GetServerSideProps = async ({
	query: { page = 1, search = false, searchQuery = '', pageSize = 10 },
}) => {
	let products: Product[] = []
	if (searchQuery) {
		products = await searchProducts(searchQuery, (page = +page), +pageSize)
	} else {
		products = await getProducts((page = +page), +pageSize)
	}

	return { props: { products, page: +page } }
}

export default Home
