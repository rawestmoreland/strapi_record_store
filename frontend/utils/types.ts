export interface Product {
	id: number
	upc: string
	supplier: number
	description: string
	image_a_path: string
	image_b_path: string
	price: number
	year: string
	format: string
	label: string
	catalog: string
	item_id: number
	genres: Genre[]
}

export interface Genre {
	id: number
	genre: string
	products: Product[]
}

export interface Format {
	id: number
	products: Product[]
	format: string
	slug: string
}
