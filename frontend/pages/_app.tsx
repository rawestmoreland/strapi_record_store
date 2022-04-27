import App from 'next/app'
import '../styles/globals.css'
import type { AppProps } from 'next/app'

import Layout from '../components/Layout'

import { getGenres } from '../utils/api'

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<Layout genres={pageProps.genres}>
			<Component {...pageProps} />
		</Layout>
	)
}

MyApp.getInitialProps = async (ctx: any) => {
	// Calls page's `getInitialProps` and fills `appProps.pageProps`
	const appProps: any = await App.getInitialProps(ctx)
	// Fetch global site settings from Strapi
	const genres = await getGenres()
	// Pass the data to our page via props
	return { ...appProps, pageProps: { genres, path: ctx.pathname } }
}

export default MyApp
