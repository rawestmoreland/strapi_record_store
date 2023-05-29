import DesktopHeader from './DesktopHeader';
import MobileMenu from './MobileMenu';
import Footer from './Footer';
import Head from 'next/head';

export default function Layout({
  navigation,
  footerNavigation,
  children,
  genres,
  artists,
}) {
  return (
    <>
      <div className="relative bg-white">
        <MobileMenu navigation={navigation} />
        <DesktopHeader navigation={navigation} />
        {children}
        <Footer footerNavigation={footerNavigation} />
      </div>
    </>
  );
}
