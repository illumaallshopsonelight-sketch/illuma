import React, { useEffect, useState } from 'react';
import { getChatMessages, sendChatMessage } from '../api';

// Only rendered when the user clicks the Chat icon — no polling or fetching
// happens for chat until this component actually mounts.
export default function ChatOverlay({ shop, onClose }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!shop) return;
    getChatMessages(shop.shop_id).then((data) => setMessages(data.messages || []));
  }, [shop]);

  async function handleSend() {
    if (!draft.trim()) return;
    await sendChatMessage(shop.shop_id, draft);
    setMessages((prev) => [...prev, { sender_type: 'user', message_text: draft, timestamp: new Date() }]);
    setDraft('');
  }

  if (!shop) return null;

  return (
    <div className="overlay-backdrop">
      <div className="overlay-panel">
        <div className="overlay-header">
          <p>Chat with {shop.business_name}</p>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="overlay-body chat-body">
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.sender_type === 'user' ? 'bubble-mine' : 'bubble-theirs'}`}>
              {m.message_text}
            </div>
          ))}
        </div>
        <div className="chat-input-row">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message"
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
}
