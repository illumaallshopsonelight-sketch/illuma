import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Storefront from './components/Storefront';
import ChatOverlay from './components/ChatOverlay';
import StatusOverlay from './components/StatusOverlay';
import DiscoverShops from './components/DiscoverShops';
import './App.css';

export default function App() {
  const [activeShop, setActiveShop] = useState(null);
  const [chatShop, setChatShop] = useState(null);     // set only when Chat icon clicked
  const [statusShop, setStatusShop] = useState(null);   // set only when Status icon clicked
  const [showDiscover, setShowDiscover] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="app-shell">
      <Sidebar
        key={refreshKey}
        activeShopId={activeShop?.shop_id}
        onSelectShop={setActiveShop}
        onDiscoverClick={() => setShowDiscover(true)}
      />

      <Storefront
        shop={activeShop}
        onOpenChat={setChatShop}
        onOpenStatus={setStatusShop}
      />

      {/* Overlays only render (and only fetch their data) when their state is set */}
      {chatShop && <ChatOverlay shop={chatShop} onClose={() => setChatShop(null)} />}
      {statusShop && <StatusOverlay shop={statusShop} onClose={() => setStatusShop(null)} />}
      {showDiscover && (
        <DiscoverShops
          onClose={() => setShowDiscover(false)}
          onFollowed={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
