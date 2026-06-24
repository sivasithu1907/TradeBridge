import React, { useState } from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';

// Public
import { LandingPage } from './components/public/LandingPage';
import { AuthModal } from './components/public/AuthModal';

// Common Layout
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { NotificationDrawer } from './components/common/NotificationDrawer';

// Importer Views
import { ImporterDashboard } from './components/importer/ImporterDashboard';
import { RfqList } from './components/importer/RfqList';
import { RfqCreationModal } from './components/importer/RfqCreationModal';
import { QuoteComparison } from './components/importer/QuoteComparison';
import { ShipmentTracking } from './components/importer/ShipmentTracking';

// Forwarder Views
import { ForwarderDashboard } from './components/forwarder/ForwarderDashboard';
import { ForwarderRfqFeed } from './components/forwarder/ForwarderRfqFeed';
import { ForwarderShipments } from './components/forwarder/ForwarderShipments';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserManagement } from './components/admin/UserManagement';
import { MarketplaceManagement } from './components/admin/MarketplaceManagement';

// Shared Views
import { DocumentsCenter } from './components/shared/DocumentsCenter';
import { MessagingCenter } from './components/shared/MessagingCenter';
import { AnalyticsDashboard } from './components/shared/AnalyticsDashboard';
import { SubscriptionManagement } from './components/shared/SubscriptionManagement';
import { Settings } from './components/shared/Settings';
import { DesignSystemScreen } from './components/shared/DesignSystemScreen';

const AppContent: React.FC = () => {
  const { activeScreen } = useMarketplace();

  // Modals & Drawers state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'importer' | 'forwarder'>('importer');
  const [isCreateRfqOpen, setIsCreateRfqOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleOpenAuth = (role: 'importer' | 'forwarder') => {
    setAuthRole(role);
    setIsAuthOpen(true);
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      // Importer
      case 'importer-dashboard':
        return <ImporterDashboard onOpenCreateRfq={() => setIsCreateRfqOpen(true)} />;
      case 'rfqs':
        return <RfqList onOpenCreateRfq={() => setIsCreateRfqOpen(true)} />;
      case 'quote-comparison':
        return <QuoteComparison />;
      case 'shipment-tracking':
        return <ShipmentTracking />;

      // Forwarder
      case 'forwarder-dashboard':
        return <ForwarderDashboard />;
      case 'forwarder-feed':
        return <ForwarderRfqFeed />;
      case 'forwarder-shipments':
        return <ForwarderShipments />;

      // Admin
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-users':
        return <UserManagement />;
      case 'admin-marketplace':
        return <MarketplaceManagement />;

      // Shared
      case 'documents':
        return <DocumentsCenter />;
      case 'messaging':
        return <MessagingCenter />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'subscription':
        return <SubscriptionManagement />;
      case 'settings':
        return <Settings />;
      case 'design-system':
        return <DesignSystemScreen />;

      default:
        return <ImporterDashboard onOpenCreateRfq={() => setIsCreateRfqOpen(true)} />;
    }
  };

  if (activeScreen === 'landing') {
    return (
      <>
        <LandingPage onOpenAuth={handleOpenAuth} />
        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          initialRole={authRole} 
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-[#111827] antialiased selection:bg-[#EB5D0B]/20 selection:text-[#EB5D0B]">
      {/* Universal Top Bar */}
      <Header 
        onOpenCreateRfq={() => setIsCreateRfqOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main Body with Sidebar + Screen View */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto overflow-x-hidden focus:outline-none pb-12">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Universal Drawers & Modals */}
      <NotificationDrawer 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <RfqCreationModal 
        isOpen={isCreateRfqOpen}
        onClose={() => setIsCreateRfqOpen(false)}
      />

      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialRole={authRole}
      />
    </div>
  );
};

export function App() {
  return (
    <MarketplaceProvider>
      <AppContent />
    </MarketplaceProvider>
  );
}

export default App;
