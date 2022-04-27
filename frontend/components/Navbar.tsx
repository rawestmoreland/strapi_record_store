import Link from 'next/link'
import { IconContext } from 'react-icons'
import { TiShoppingCart } from 'react-icons/ti'

const Navbar = () => {
	return (
		<div className='flex justify-between ml-6 mr-6 mt-4'>
			<Link href='/'>Record Store</Link>
			<button className='snipcart-checkout flex items-center'>
				<IconContext.Provider
					value={{ color: '#6366f1', size: '1.25em' }}
				>
					<TiShoppingCart />
				</IconContext.Provider>
				<span className='snipcart-total-price ml-3 font-semibold text-sm text-indigo-500'></span>
			</button>
		</div>
	)
}

export default Navbar
