import React, { useEffect, useState } from 'react';
import { getShopStatus } from '../api';

// Only rendered when the Status icon is clicked — mirrors ChatOverlay's pattern.
export default function StatusOverlay({ shop, onClose }) {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    if (!shop) return;
    getShopStatus(shop.shop_id).then(setUpdates).catch(() => setUpdates([]));
  }, [shop]);

  if (!shop) return null;

  return (
    <div className="overlay-backdrop">
      <div className="overlay-panel">
        <div className="overlay-header">
          <p>Status updates — {shop.business_name}</p>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="overlay-body">
          {updates.length === 0 && <p>No recent updates.</p>}
          {updates.map((u) => (
            <div key={u.status_id} className="status-item">
              <p className="status-name">New: {u.name} — ₹{u.price}</p>
              <p className="status-time">{new Date(u.posted_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
