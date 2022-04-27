const qs = require('qs')

export function getStrapiURL(path: string) {
	return `${
		process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1338'
	}${path}`
}

// Helper to make GET requests to Strapi
export async function fetchAPI(path: string) {
	const requestUrl = getStrapiURL(path)
	const response = await fetch(requestUrl)
	const data = await response.json()
	return data
}

export async function getGenres() {
	const categories = await fetchAPI('/api/genres')
	return categories
}

export async function getGenre(slug: string) {
	const categories = await fetchAPI(`/api/genres?slug=${slug}`)
	return categories?.[0]
}

export async function getFormats() {
	const formats = await fetchAPI('/api/formats')
	return formats
}

export async function getProducts(
	page: number | null = null,
	pageSize: number = 10
) {
	const query =
		page !== null
			? qs.stringify(
					{
						pagination: {
							page,
							pageSize,
						},
					},
					{
						encodeValuesOnly: true,
					}
			  )
			: null

	const products = await fetchAPI(
		`/api/products${query !== null ? '?' + query : ''}`
	)
	return products
}

export async function getProduct(item_id: number) {
	const query = qs.stringify(
		{
			populate: ['format'],
			filters: {
				item_id: {
					$eq: item_id,
				},
			},
		},
		{
			encodeValuesOnly: true,
		}
	)
	const product = await fetchAPI(`/api/products?${query}`)
	return product?.data?.[0]
}

export async function searchProducts(value: string) {
	console.log(value)
	const query = qs.stringify(
		{
			filters: {
				description: {
					$containsi: value,
				},
			},
		},
		{ encodeValuesOnly: true }
	)
	const products = await fetchAPI(`/api/products?${query}`)
	console.log(products)
	return products
}
