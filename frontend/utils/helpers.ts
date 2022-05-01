/**
 * Take the router.query object and parse together
 * a string of &queryParams.
 */
export const extraParamsFromRouterQuery = (query: any) => {
	let queryString = ''
	if (!query) return queryString
	console.log('query from helper: ', query)
	for (let key in query) {
		queryString += `&${key}=${query[key]}`
	}
	return queryString
}
