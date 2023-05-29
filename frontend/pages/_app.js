import { SnipcartProvider } from '@/hooks/useSnipcart';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <SnipcartProvider>
      <Component {...pageProps} />
    </SnipcartProvider>
  );
}
