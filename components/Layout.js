// components/Layout.js
// Layout wrapper component that includes navbar and footer

import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, hideNav = false, hideFooter = false }) {
  const router = useRouter();
  
  // Public routes that don't need the navbar
  const isPublicRoute = ['/', '/login'].includes(router.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNav && !isPublicRoute && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}