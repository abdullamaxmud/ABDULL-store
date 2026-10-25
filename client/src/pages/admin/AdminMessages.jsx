import React, { useState, useEffect } from 'react';
import supportService from '../../services/supportService';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../layouts/AdminLayout';
import formatDate from '../../utils/formatDate';

const statusBadge = {
  New: 'badge-accent',
  Read: 'badge-warning',
  Resolved: 'badge-success',
};

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await supportService.getMessages(filter ? { status: filter } : {});
        if (res.success) {
          setMessages(res.data);
          setSubscriberCount(res.subscriberCount || 0);
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const setStatus = async (msg, status) => {
    try {
      const res = await supportService.updateMessageStatus(msg._id, status);
      if (res.success) {
        setMessages(messages.map((m) => (m._id === msg._id ? res.data : m)));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openMessage = (msg) => {
    setExpanded(expanded === msg._id ? null : msg._id);
    if (msg.status === 'New') setStatus(msg, 'Read');
  };

  const newCount = messages.filter((m) => m.status === 'New').length;

  return (
    <AdminLayout title="Customer Messages">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Messages shown</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{messages.length}</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Unread</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent)' }}>{newCount}</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Newsletter subscribers</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{subscriberCount}</div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Inbox</h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['', 'New', 'Read', 'Resolved'].map((s) => (
              <button key={s || 'all'} className={`help-pill${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>No messages here yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {messages.map((m) => (
              <div key={m._id} className="faq-item">
                <button className="faq-question" onClick={() => openMessage(m)} aria-expanded={expanded === m._id}>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                    <span style={{ fontWeight: m.status === 'New' ? 900 : 700 }}>
                      {m.topic} — {m.name}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.email} · {formatDate(m.createdAt)}
                    </span>
                  </span>
                  <span className={`badge ${statusBadge[m.status]}`}>{m.status}</span>
                </button>
                {expanded === m._id && (
                  <div className="faq-answer">
                    {m.orderNumber && (
                      <div style={{ marginBottom: '8px', fontSize: '0.85rem' }}>
                        <strong>Order:</strong> {m.orderNumber}
                      </div>
                    )}
                    <p style={{ whiteSpace: 'pre-wrap', marginBottom: '14px' }}>{m.message}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.topic}`)}`} className="btn btn-primary btn-xs">
                        Reply by email
                      </a>
                      {m.status !== 'Resolved' ? (
                        <button className="btn btn-outline btn-xs" onClick={() => setStatus(m, 'Resolved')}>Mark resolved</button>
                      ) : (
                        <button className="btn btn-outline btn-xs" onClick={() => setStatus(m, 'Read')}>Reopen</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
