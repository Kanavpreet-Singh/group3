import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'

const BASE_URL = import.meta.env.VITE_API_URL;

const MessageAnalytics = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
  const headers = token ? { token: token } : {};
  const res = await fetch(`${BASE_URL}/api/chats/messages/other`, { headers });

        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }

        const data = await res.json();
        setMessages(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };

    // Fetch only when component mounts and when logged in (endpoint is protected)
    if (isLoggedIn) fetchMessages();
  }, [isLoggedIn]);

  const visible = messages.filter(m => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      String(m.id).includes(q) ||
      String(m.conversation_id).includes(q) ||
      (m.sender || '').toLowerCase().includes(q) ||
      (m.message || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="message-analytics" style={{ padding: 16 }}>
      <h2>Message Analytics — category: other</h2>

      {!isLoggedIn && (
        <div style={{ color: 'orange' }}>You must be logged in to fetch messages.</div>
      )}

      {loading && <div>Loading messages…</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!loading && !error && (
        <div>
          <div style={{ margin: '8px 0' }}>
            <strong>Total messages (category: other):</strong> {messages.length}
          </div>

          <div style={{ marginBottom: 12 }}>
            <button onClick={() => setShowMessages(s => !s)} style={{ padding: '6px 12px' }}>
              {showMessages ? 'Hide messages' : 'Show messages'}
            </button>
            <button
              onClick={async () => {
                try {
                  setLoading(true);
                  const token = localStorage.getItem('token');
                  const res = await fetch(`${BASE_URL}/api/chats/messages/classify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...(token ? { token } : {}) },
                    body: JSON.stringify({}),
                  });
                  const data = await res.json();
                  // After classification, refetch messages
                  const res2 = await fetch(`${BASE_URL}/api/chats/messages/other`, { headers: token ? { token } : {} });
                  const refreshed = await res2.json();
                  setMessages(refreshed);
                  setLoading(false);
                  alert(data.message || 'Classification complete');
                } catch (err) {
                  setLoading(false);
                  setError(err.message || 'Classification failed');
                }
              }}
              style={{ padding: '6px 12px', marginLeft: 8 }}
            >
              Classify messages
            </button>
          </div>

          {showMessages && (
            <>
              <div style={{ margin: '8px 0' }}>
                <input
                  placeholder="Filter by id, conversation, sender or text"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  style={{ padding: 8, width: '100%', maxWidth: 480 }}
                />
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 8 }}>ID</th>
                          <th style={{ textAlign: 'left', padding: 8 }}>Category</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Conversation</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Sender</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Message</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map(m => (
                      <tr key={m.id} style={{ borderTop: '1px solid #eee' }}>
                        <td style={{ padding: 8 }}>{m.id}</td>
                        <td style={{ padding: 8 }}>{m.category || '—'}</td>
                        <td style={{ padding: 8 }}>{m.conversation_id}</td>
                        <td style={{ padding: 8 }}>{m.sender}</td>
                        <td style={{ padding: 8, maxWidth: 480 }}>{m.message}</td>
                        <td style={{ padding: 8 }}>{new Date(m.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {visible.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: 16, textAlign: 'center' }}>
                          No messages found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default MessageAnalytics
