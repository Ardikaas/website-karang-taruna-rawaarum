import { useState, useEffect } from 'react';
import {
  fetchContactMessages,
  updateMessageStatus,
  deleteContactMessage,
} from '../../services/api';

const AdminPesanPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Detail Modal
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchContactMessages(statusFilter);
        setMessages(data);
      } catch (err) {
        setError(err.message || 'Gagal memuat pesan masuk.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [statusFilter]);

  const handleSelectMessage = async (msg) => {
    setSelectedMessage(msg);
    if (msg.status === 'unread') {
      try {
        await updateMessageStatus(msg._id, 'read');
        setMessages((prev) =>
          prev.map((item) =>
            item._id === msg._id ? { ...item, status: 'read' } : item
          )
        );
      } catch (_err) {
        // Handled silently
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateMessageStatus(id, newStatus);
      setMessages((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: newStatus } : item
        )
      );
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.message || 'Gagal mengubah status pesan.');
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteContactMessage(id);
      setDeleteConfirmId(null);
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(null);
      }
      setMessages((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message || 'Gagal menghapus pesan.');
    } finally {
      setDeleting(false);
    }
  };

  const formatWaLink = (phone, name, subject) => {
    if (!phone) return '#';
    const cleanNum = phone.replace(/[^0-9]/g, '');
    const formattedNum = cleanNum.startsWith('0')
      ? '62' + cleanNum.slice(1)
      : cleanNum;
    const text = `Halo ${name || 'Kak'}, kami dari Sekretariat Karang Taruna Rawa Arum menanggapi pesan Anda mengenai "${subject || 'Permohonan Kontak'}":\n\n`;
    return `https://wa.me/${formattedNum}?text=${encodeURIComponent(text)}`;
  };

  const filteredMessages = messages.filter((msg) => {
    const q = searchQuery.toLowerCase();
    return (
      msg.name?.toLowerCase().includes(q) ||
      msg.email?.toLowerCase().includes(q) ||
      msg.phone?.toLowerCase().includes(q) ||
      msg.subject?.toLowerCase().includes(q) ||
      msg.message?.toLowerCase().includes(q)
    );
  });

  const unreadCount = messages.filter((m) => m.status === 'unread').length;
  const readCount = messages.filter((m) => m.status === 'read').length;
  const repliedCount = messages.filter((m) => m.status === 'replied').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'unread':
        return (
          <span className="admin-badge admin-badge--warning">
            <i
              className="fa-solid fa-envelope"
              style={{ marginRight: '4px' }}
            />
            Belum Dibaca
          </span>
        );
      case 'read':
        return (
          <span className="admin-badge admin-badge--info">
            <i
              className="fa-solid fa-envelope-open"
              style={{ marginRight: '4px' }}
            />
            Sudah Dibaca
          </span>
        );
      case 'replied':
        return (
          <span className="admin-badge admin-badge--success">
            <i
              className="fa-solid fa-check-double"
              style={{ marginRight: '4px' }}
            />
            Sudah Dibalas
          </span>
        );
      case 'archived':
        return (
          <span className="admin-badge admin-badge--secondary">
            <i
              className="fa-solid fa-box-archive"
              style={{ marginRight: '4px' }}
            />
            Diarsipkan
          </span>
        );
      default:
        return <span className="admin-badge">{status}</span>;
    }
  };

  return (
    <div className="admin-page">
      {/* Top Bar / Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Pesan Masuk & Pengaduan</h1>
          <p className="admin-page-subtitle">
            Kelola pesan, permohonan kemitraan, dan aduan dari masyarakat Rawa
            Arum.
          </p>
        </div>
      </div>

      {/* Stats Widget Grid */}
      <div className="admin-stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-stat-card">
          <div
            className="admin-stat-card__icon"
            style={{ background: '#eff6ff', color: '#3b82f6' }}
          >
            <i className="fa-solid fa-inbox" />
          </div>
          <div>
            <div className="admin-stat-card__value">{messages.length}</div>
            <div className="admin-stat-card__label">Total Pesan</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="admin-stat-card__icon"
            style={{ background: '#fff7ed', color: '#f97316' }}
          >
            <i className="fa-solid fa-envelope-circle-check" />
          </div>
          <div>
            <div className="admin-stat-card__value">{unreadCount}</div>
            <div className="admin-stat-card__label">Belum Dibaca</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="admin-stat-card__icon"
            style={{ background: '#f0fdf4', color: '#22c55e' }}
          >
            <i className="fa-solid fa-reply-all" />
          </div>
          <div>
            <div className="admin-stat-card__value">{repliedCount}</div>
            <div className="admin-stat-card__label">Sudah Dibalas</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div
        className="admin-card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'Semua Pesan' },
            { key: 'unread', label: `Belum Dibaca (${unreadCount})` },
            { key: 'read', label: `Sudah Dibaca (${readCount})` },
            { key: 'replied', label: `Sudah Dibalas (${repliedCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`admin-btn ${
                statusFilter === tab.key
                  ? 'admin-btn--primary'
                  : 'admin-btn--outline'
              } admin-btn--sm`}
              style={{ borderRadius: '20px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            className="admin-form-control"
            placeholder="Cari pengirim / isi pesan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.4rem', borderRadius: '20px' }}
          />
          <i
            className="fa-solid fa-magnifying-glass"
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
        </div>
      </div>

      {/* Messages Table Card */}
      <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
        {error && (
          <div
            className="admin-alert admin-alert--error"
            style={{ margin: '1rem' }}
          >
            <i className="fa-solid fa-circle-exclamation" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <i
              className="fa-solid fa-spinner fa-spin"
              style={{ fontSize: '2rem', color: 'var(--accent)' }}
            />
            <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)' }}>
              Memuat data pesan...
            </p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <i
              className="fa-regular fa-folder-open"
              style={{ fontSize: '3rem', color: 'var(--text-muted)' }}
            />
            <p
              style={{
                marginTop: '1rem',
                fontWeight: 700,
                color: 'var(--primary-deep)',
              }}
            >
              Belum Ada Pesan Masuk
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Pesan dari masyarakat yang dikirim melalui formulir kontak akan
              muncul di sini.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pengirim</th>
                  <th>Kontak</th>
                  <th>Kebutuhan / Subjek</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((msg) => (
                  <tr
                    key={msg._id}
                    style={{
                      background:
                        msg.status === 'unread'
                          ? 'rgba(249, 115, 22, 0.03)'
                          : 'transparent',
                    }}
                  >
                    <td>
                      <div
                        style={{
                          fontWeight: 700,
                          color: 'var(--primary-deep)',
                        }}
                      >
                        {msg.name}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <div>
                          <i
                            className="fa-solid fa-envelope"
                            style={{ marginRight: '6px', color: '#64748b' }}
                          />
                          <a
                            href={`mailto:${msg.email}`}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                          >
                            {msg.email}
                          </a>
                        </div>
                        <div style={{ marginTop: '4px' }}>
                          <i
                            className="fa-brands fa-whatsapp"
                            style={{ marginRight: '6px', color: '#22c55e' }}
                          />
                          <a
                            href={formatWaLink(
                              msg.phone,
                              msg.name,
                              msg.subject
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#22c55e',
                              textDecoration: 'none',
                              fontWeight: 600,
                            }}
                          >
                            {msg.phone}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge--neutral">
                        {msg.subject}
                      </span>
                    </td>
                    <td>{getStatusBadge(msg.status)}</td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {new Date(msg.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <button
                          className="admin-btn admin-btn--primary admin-btn--sm"
                          onClick={() => handleSelectMessage(msg)}
                          title="Baca Pesan"
                        >
                          <i className="fa-solid fa-eye" /> Baca
                        </button>
                        <a
                          href={formatWaLink(msg.phone, msg.name, msg.subject)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-btn admin-btn--success admin-btn--sm"
                          title="Balas via WhatsApp"
                          style={{
                            background: '#22c55e',
                            borderColor: '#22c55e',
                            color: '#fff',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          <i className="fa-brands fa-whatsapp" />
                        </a>
                        <button
                          className="admin-btn admin-btn--danger admin-btn--sm"
                          onClick={() => setDeleteConfirmId(msg._id)}
                          title="Hapus Pesan"
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedMessage && (
        <div className="admin-modal-overlay">
          <div
            className="admin-modal"
            style={{
              maxWidth: '650px',
              width: '92%',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <div
              className="admin-modal__header"
              style={{
                background: '#0f172a',
                padding: '1.25rem 1.5rem',
                color: '#fff',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <i
                  className="fa-solid fa-envelope-open-text"
                  style={{ color: 'var(--accent)' }}
                />
                Detail Pesan Masuk
              </h2>
              <button
                className="admin-modal__close"
                onClick={() => setSelectedMessage(null)}
                style={{
                  color: '#94a3b8',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="admin-modal__body" style={{ padding: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: 'var(--primary-deep)',
                    }}
                  >
                    {selectedMessage.name}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    <span>Email: {selectedMessage.email}</span> &bull;{' '}
                    <span>WA: {selectedMessage.phone}</span>
                  </div>
                </div>
                <div>{getStatusBadge(selectedMessage.status)}</div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Kebutuhan / Topik
                </span>
                <div
                  style={{
                    fontWeight: 700,
                    color: 'var(--primary-deep)',
                    fontSize: '0.95rem',
                  }}
                >
                  {selectedMessage.subject}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Isi Pesan
                </span>
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    lineHeight: '1.6',
                    color: '#334155',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {selectedMessage.message}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="admin-btn admin-btn--outline admin-btn--sm"
                    onClick={() =>
                      handleUpdateStatus(
                        selectedMessage._id,
                        selectedMessage.status === 'replied'
                          ? 'read'
                          : 'replied'
                      )
                    }
                  >
                    {selectedMessage.status === 'replied' ? (
                      'Tandai Belum Dibalas'
                    ) : (
                      <>
                        <i className="fa-solid fa-check" /> Tandai Sudah Dibalas
                      </>
                    )}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject
                    )}`}
                    className="admin-btn admin-btn--outline admin-btn--sm"
                    style={{ textDecoration: 'none' }}
                  >
                    <i className="fa-solid fa-envelope" /> Balas Email
                  </a>
                  <a
                    href={formatWaLink(
                      selectedMessage.phone,
                      selectedMessage.name,
                      selectedMessage.subject
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn admin-btn--success admin-btn--sm"
                    style={{
                      background: '#22c55e',
                      borderColor: '#22c55e',
                      color: '#fff',
                      textDecoration: 'none',
                    }}
                  >
                    <i className="fa-brands fa-whatsapp" /> Balas WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="admin-modal-overlay">
          <div
            className="admin-modal"
            style={{
              maxWidth: '400px',
              borderRadius: '12px',
              padding: '1.5rem',
            }}
          >
            <h3
              style={{
                margin: '0 0 0.5rem 0',
                color: 'var(--primary-deep)',
                fontSize: '1.1rem',
              }}
            >
              Hapus Pesan Masuk?
            </h3>
            <p
              style={{
                fontSize: '0.85rem',
                color: '#64748b',
                marginBottom: '1.25rem',
              }}
            >
              Apakah Anda yakin ingin menghapus pesan ini? Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.5rem',
              }}
            >
              <button
                className="admin-btn admin-btn--outline admin-btn--sm"
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
              >
                Batal
              </button>
              <button
                className="admin-btn admin-btn--danger admin-btn--sm"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPesanPage;
