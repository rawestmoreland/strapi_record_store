import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
	return (
		<Html>
			<Head>
				<link rel='preconnect' href='https://app.snipcart.com' />
				<link rel='preconnect' href='https://cdn.snipcart.com' />
				<link
					rel='stylesheet'
					href='https://cdn.snipcart.com/themes/v3.2.0/default/snipcart.css'
				/>
				<script
					async
					src='https://cdn.snipcart.com/themes/v3.2.0/default/snipcart.js'
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	)
}
