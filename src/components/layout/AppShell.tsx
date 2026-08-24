import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { SearchModal } from '../SearchModal';

export const AppShell: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <div className="studyforge-app-layout">
      {/* Desktop Persistent Sidebar */}
      <div className="desktop-sidebar-container">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="app-main-viewport">
        {/* Top Header */}
        <Header
          onSearchOpen={() => setSearchModalOpen(true)}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main className="app-page-content" id="main-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Universal Search Palette Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
};
