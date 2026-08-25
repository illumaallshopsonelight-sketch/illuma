import React, { useEffect, useMemo, useState } from 'react';
import { getFollowedShops } from '../api';

export default function Sidebar({ activeShopId, onSelectShop, onDiscoverClick, user, onLogout }) {
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getFollowedShops().then(setShops).catch(() => setShops([]));
  }, []);

  const visibleShops = useMemo(() => shops.filter((shop) =>
    `${shop.business_name} ${shop.category || ''}`.toLowerCase().includes(search.toLowerCase())
  ), [shops, search]);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="logo-mark">Illuma</span>
        <button className="text-btn logout-btn" onClick={onLogout}>Log out</button>
      </div>
      <p className="user-greeting">Hi, {user.name}</p>
      <input className="search-input" placeholder="Search your shops" value={search} onChange={(e) => setSearch(e.target.value)} />
      <p className="section-label">Your shops</p>
      <div className="shop-list">
        {visibleShops.length === 0 && <p className="empty-hint">{shops.length ? 'No matching shops.' : 'You have not followed any shops yet.'}</p>}
        {visibleShops.map((shop) => (
          <button key={shop.shop_id} className={`shop-row ${activeShopId === shop.shop_id ? 'active' : ''}`} onClick={() => onSelectShop(shop)}>
            <div className="avatar">{shop.business_name.charAt(0)}</div>
            <div className="shop-row-text"><p className="shop-name">{shop.business_name}</p><p className="shop-category">{shop.category}</p></div>
          </button>
        ))}
      </div>
      <button className="discover-btn" onClick={onDiscoverClick}>Discover shops</button>
    </aside>
  );
}
