import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AnnouncementBar } from '../common/AnnouncementBar.js';
import { Header } from '../common/Header.js';
import { Footer } from '../common/Footer.js';
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';

export const MainLayout: React.FC = () => {
  const { initialize } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    initialize();
    fetchCart();
  }, [initialize, fetchCart]);

  return (
    <div className="flex flex-col min-h-screen bg-vastra-bg">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
