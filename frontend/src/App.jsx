import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Storefront from './components/Storefront';
import ChatOverlay from './components/ChatOverlay';
import StatusOverlay from './components/StatusOverlay';
import DiscoverShops from './components/DiscoverShops';
import AuthScreen from './components/AuthScreen';
import './App.css';

function savedUser() {
  try {
    return JSON.parse(localStorage.getItem('illuma_user'));
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(savedUser);
  const [activeShop, setActiveShop] = useState(null);
  const [chatShop, setChatShop] = useState(null);
  const [statusShop, setStatusShop] = useState(null);
  const [showDiscover, setShowDiscover] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleLogout() {
    localStorage.removeItem('illuma_token');
    localStorage.removeItem('illuma_user');
    setActiveShop(null);
    setUser(null);
  }

  if (!user) return <AuthScreen onAuthenticated={setUser} />;

  return (
    <div className="app-shell">
      <Sidebar key={refreshKey} activeShopId={activeShop?.shop_id} onSelectShop={setActiveShop} onDiscoverClick={() => setShowDiscover(true)} user={user} onLogout={handleLogout} />
      <Storefront shop={activeShop} onOpenChat={setChatShop} onOpenStatus={setStatusShop} />
      {chatShop && <ChatOverlay shop={chatShop} onClose={() => setChatShop(null)} />}
      {statusShop && <StatusOverlay shop={statusShop} onClose={() => setStatusShop(null)} />}
      {showDiscover && <DiscoverShops onClose={() => setShowDiscover(false)} onFollowed={() => setRefreshKey((k) => k + 1)} />}
    </div>
  );
}
