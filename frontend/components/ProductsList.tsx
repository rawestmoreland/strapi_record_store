import React from 'react'
import Link from 'next/link'

import NextImage from './Image'

const ProductsList = ({ products }: any) => {
	const { data, meta } = products
	return (
		<div className='m-6 grid grod-cols-1 sm:grid-cols-3 gap-4 mt-8'>
			{data
				.filter(
					(_product: any) => _product.attributes.image_a_path !== null
				)
				.map((_product: any) => {
					const { attributes } = _product
					return (
						<div
							key={_product.id}
							className='border rounded-lg bg-gray-100 hover:shadow-lg shadow-md'
						>
							<Link href={`/products/${attributes.item_id}`}>
								<a>
									<div className='w-full bg-white'>
										<div className='rounded-t-lg pt-2 pb-2 w-1/2 mx-auto'>
											<NextImage
												src={attributes.image_a_path}
												height='300'
												width='300'
											/>
										</div>
									</div>
									<div className='pl-4 pr-4 pb-4 pt-4 rounded-lg'>
										<h4 className='mt-1 font-semibold text-base leading-tight text-gray-700'>
											{attributes.description}
										</h4>
									</div>
								</a>
							</Link>
						</div>
					)
				})}
		</div>
	)
}

export default ProductsList
