import {useState} from 'react';

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
  const [sideNavOpen, setSideNavOpen] = useState(false);

  const toggleNav = () => setSideNavOpen(!sideNavOpen);

  return (
    <>
      <div className="relative bg-white">
        <MobileMenu navigation={navigation} open={sideNavOpen} onRequestClose={() => setSideNavOpen(false)} />
        <DesktopHeader navigation={navigation} toggleNav={toggleNav} />
        {children}
        <Footer footerNavigation={footerNavigation} />
      </div>
    </>
  );
}
