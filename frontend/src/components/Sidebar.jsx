import React, { useEffect, useState } from 'react';
import { getFollowedShops } from '../api';

// Sidebar = the "contact list", but each contact is a shop instead of a person.
export default function Sidebar({ activeShopId, onSelectShop, onDiscoverClick }) {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    getFollowedShops().then(setShops).catch(() => setShops([]));
  }, []);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="logo-mark">ShopConnect</span>
      </div>

      <input className="search-input" placeholder="Search shops" />

      <p className="section-label">Your shops</p>

      <div className="shop-list">
        {shops.length === 0 && (
          <p className="empty-hint">You haven't followed any shops yet.</p>
        )}
        {shops.map((shop) => (
          <div
            key={shop.shop_id}
            className={`shop-row ${activeShopId === shop.shop_id ? 'active' : ''}`}
            onClick={() => onSelectShop(shop)}
          >
            <div className="avatar">{shop.business_name.charAt(0)}</div>
            <div className="shop-row-text">
              <p className="shop-name">{shop.business_name}</p>
              <p className="shop-category">{shop.category}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="discover-btn" onClick={onDiscoverClick}>
        Discover shops
      </button>
    </div>
  );
}
