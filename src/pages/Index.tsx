
import React from 'react';
import { AppProvider } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import InventorySection from '@/components/InventorySection';
import MenuItemsSection from '@/components/MenuItemsSection';
import SalesSection from '@/components/SalesSection';
import ReportSection from '@/components/ReportSection';
import HistorySection from '@/components/HistorySection';

const Index = () => {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white shadow-sm py-4">
          <div className="container max-w-screen-lg mx-auto px-4">
            <h1 className="text-4xl font-bold text-center text-brand-blue">BE MY CRUST</h1>
            <p className="text-gray-600 text-center mt-1">Daily Inventory Management</p>
          </div>
        </header>

        <div className="container max-w-screen-lg mx-auto px-4 py-8 flex-1 flex flex-col">
          <AppContent />
        </div>

        <footer className="bg-white py-4 border-t">
          <div className="container max-w-screen-lg mx-auto px-4">
            <p className="text-center text-sm text-gray-500">BE MY CRUST © 2025</p>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
};

const AppContent = () => {
  const { selectedTab } = React.useContext(AppProvider.context);

  return (
    <>
      <Navigation className="mb-6" />
      <div className="flex-1">
        {selectedTab === 'Inventory' && <InventorySection />}
        {selectedTab === 'Menu Items' && <MenuItemsSection />}
        {selectedTab === 'Sales' && <SalesSection />}
        {selectedTab === 'Report' && <ReportSection />}
        {selectedTab === 'History' && <HistorySection />}
      </div>
    </>
  );
};

export default Index;
