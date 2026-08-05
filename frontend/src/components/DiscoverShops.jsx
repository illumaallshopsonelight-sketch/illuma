import React, { useEffect, useState } from 'react';
import { discoverShops, followShop } from '../api';

export default function DiscoverShops({ onClose, onFollowed }) {
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    discoverShops({ search }).then(setShops).catch(() => setShops([]));
  }, [search]);

  async function handleFollow(shopId) {
    await followShop(shopId);
    onFollowed();
  }

  return (
    <div className="overlay-backdrop">
      <div className="overlay-panel">
        <div className="overlay-header">
          <p>Discover shops</p>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="overlay-body">
          <input
            placeholder="Search by shop name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: '10px', width: '100%' }}
          />
          {shops.map((shop) => (
            <div key={shop.shop_id} className="discover-row">
              <div>
                <p className="shop-name">{shop.business_name}</p>
                <p className="shop-category">{shop.category}</p>
              </div>
              <button onClick={() => handleFollow(shop.shop_id)}>Follow</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
