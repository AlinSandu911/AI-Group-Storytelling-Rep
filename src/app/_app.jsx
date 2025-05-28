import { AuthProvider } from '@/contexts/AuthContext';
import { FamilyProvider } from '@/contexts/FamilyContext';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <FamilyProvider>
        <Component {...pageProps} />
      </FamilyProvider>
    </AuthProvider>
  );
}