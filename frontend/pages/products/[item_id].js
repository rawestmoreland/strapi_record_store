import React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { getProducts, getProduct } from '../../utils/api'

import NextImage from '../../components/Image'

const ProductPage = ({ product }) => {
	const router = useRouter()

	const attributes = product?.attributes
	const format = attributes?.format?.data?.attributes?.format
	return (
		<>
			{attributes ? (
				<div className='m-6 grid grid-cols-1 gap-4 mt-8'>
					<Head>
						<title>{attributes.description}</title>
					</Head>
					<div className='flex flex-col sm:flex-row justify-center items-center gap-x-4'>
						{attributes.image_a_path && (
							<div className='flex flex-col'>
								<span className='text-xl font-semibold text-gray-700 mb-2 text-center'>
									Front
								</span>
								<NextImage
									src={attributes.image_a_path}
									height='300'
									width='300'
								/>
							</div>
						)}
						{attributes.image_b_path && (
							<div className='flex flex-col'>
								<span className='text-xl font-semibold text-gray-700 mb-2 text-center'>
									Back
								</span>
								<NextImage
									src={attributes.image_b_path}
									height='300'
									width='300'
								/>
							</div>
						)}
					</div>
					<div className='w-full flex flex-col justify-between'>
						<div>
							<h4 className='mt-1 font-semibold text-lg leading-tight text-gray-700'>
								{attributes.description || ''}
							</h4>
						</div>
						<p className='mt-1 font-semibold text-lg leading-tight text-gray-700'>
							{attributes.year || ''}
						</p>
						<p className='mt-1 font-semibold text-lg leading-tight text-gray-700'>
							{format} - ${attributes.sell_price}
						</p>

						<button
							className='snipcart-add-item mt-4 bg-white border border-gray-200 d hover:shadow-lg text-gray-700 font-semibold py-2 px-4 rounded shadow'
							data-item-id={attributes.item_id}
							data-item-price={attributes.sell_price}
							data-item-url={router.asPath}
							data-item-description={attributes.description}
							data-item-image={attributes.image_a_path || ''}
							data-item-name={attributes.description}
							v-bind='customFields'
						>
							Add to cart
						</button>
					</div>
				</div>
			) : (
				<div>cannot be found</div>
			)}
		</>
	)
}

export async function getStaticProps({ params }) {
	const product = await getProduct(params.item_id)
	return { props: { product } }
}

export async function getStaticPaths() {
	const products = await getProducts()
	const { data } = products
	return {
		paths: data.map((_product) => {
			return {
				params: { item_id: _product.attributes.item_id },
			}
		}),
		fallback: true,
	}
}

export default ProductPage
