import Navbar from './Navbar'

const Layout = ({ children, genres }: any) => {
	return (
		<div className='flex justify-center bg-gray-200'>
			<div className='max-w-screen-lg flex flex-col min-h-screen w-full'>
				<Navbar />
				<div className='flex-grow'>{children}</div>
			</div>
			<div
				hidden
				id='snipcart'
				data-api-key={process.env.SNIPCART_API_KEY}
			/>
		</div>
	)
}

export default Layout
