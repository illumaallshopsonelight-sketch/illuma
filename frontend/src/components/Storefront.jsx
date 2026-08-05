import React, { useEffect, useState } from 'react';
import { getShopStorefront } from '../api';

// This is what shows by default when a shop is clicked in the sidebar —
// NOT chat, NOT status. Those only appear when their icon is clicked.
export default function Storefront({ shop, onOpenChat, onOpenStatus }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!shop) return;
    getShopStorefront(shop.slug).then(setData).catch(() => setData(null));
  }, [shop]);

  if (!shop) {
    return <div className="storefront-empty">Select a shop to view its storefront</div>;
  }
  if (!data) {
    return <div className="storefront-loading">Loading storefront...</div>;
  }

  const { shop: shopInfo, products } = data;

  return (
    <div className="storefront-panel">
      <div className="storefront-header">
        <div className="avatar">{shopInfo.business_name.charAt(0)}</div>
        <div className="storefront-header-text">
          <p className="shop-name">{shopInfo.business_name}</p>
          <p className="shop-category">{shopInfo.category}</p>
        </div>
        {/* These are the two icons that open overlays ONLY on click */}
        <button className="icon-btn" onClick={() => onOpenStatus(shop)}>Status</button>
        <button className="icon-btn" onClick={() => onOpenChat(shop)}>Chat</button>
      </div>

      <div className="product-grid">
        {products.length === 0 && <p>No products listed yet.</p>}
        {products.map((product) => (
          <div key={product.product_id} className="product-card">
            <div
              className="product-image"
              style={{ backgroundImage: product.image_url ? `url(${product.image_url})` : undefined }}
            />
            <p className="product-name">{product.name}</p>
            <p className="product-price">₹{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
