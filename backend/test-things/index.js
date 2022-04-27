const fetch = require('node-fetch')

async function fetchAPI(path) {
	const response = await fetch(`http://localhost:1338/api${path}`)
	const data = await response.json()
	return data
}

async function fetchFormats() {
	const formats = await fetchAPI('/formats')
	return formats
}

async function run() {
	const formats = await fetchFormats()
}

run()
