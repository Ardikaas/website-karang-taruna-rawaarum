import { useState, useEffect } from 'react';
import { fetchSubscribers, deleteSubscriber, sendBroadcastEmail } from '../../services/api';

const AdminSubscriberPage = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tabs State
  const [activeSubTab, setActiveSubTab] = useState('list'); // 'list' | 'broadcast'

  // Search state
  const [search, setSearch] = useState('');

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Broadcast Form State
  const [broadcastForm, setBroadcastForm] = useState({ subject: '', content: '' });
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState('');
  const [broadcastError, setBroadcastError] = useState('');

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      const data = await fetchSubscribers();
      setSubscribers(data);
    } catch (err) {
      setError('Gagal mengambil data subscriber.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteSubscriber(id);
      setDeleteConfirmId(null);
      loadSubscribers();
    } catch (err) {
      alert(err.message || 'Gagal menghapus subscriber.');
    } finally {
      setDeleting(false);
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    setBroadcastError('');
    setBroadcastSuccess('');
    setBroadcasting(true);

    try {
      const res = await sendBroadcastEmail(broadcastForm.subject, broadcastForm.content);
      setBroadcastSuccess(res.message || 'Newsletter berhasil disebarkan ke seluruh subscriber!');
      setBroadcastForm({ subject: '', content: '' });
    } catch (err) {
      setBroadcastError(err.message || 'Gagal mengirim email broadcast. Harap cek konfigurasi SMTP di server.');
    } finally {
      setBroadcasting(false);
    }
  };

  const exportToCSV = () => {
    if (filteredSubscribers.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    const headers = ['Alamat Email', 'Tanggal Berlangganan'];
    const rows = filteredSubscribers.map((sub) => [
      sub.email,
      new Date(sub.createdAt).toLocaleString('id-ID')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Daftar_Subscriber_Kartar_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && subscribers.length === 0) {
    return (
      <div className="admin-loading-container">
        <i className="fa-solid fa-spinner fa-spin admin-spinner" />
        <p>Memuat data subscriber...</p>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Subscriber & Newsletter</h1>
          <p className="admin-page-subtitle">Kelola daftar email warga dan kirimkan update informasi secara massal.</p>
        </div>
        {activeSubTab === 'list' && (
          <button className="admin-btn admin-btn--outline" onClick={exportToCSV}>
            <i className="fa-solid fa-file-excel" style={{ color: '#10b981' }} /> Ekspor CSV
          </button>
        )}
      </div>

      {error && (
        <div className="admin-alert admin-alert--error" style={{ marginBottom: '1.5rem' }}>
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {/* Sub tabs configuration */}
      <div className="admin-tabs" style={{ borderBottom: '1px solid #edf2f7', marginBottom: '1.5rem' }}>
        <button
          className={`admin-tab-btn ${activeSubTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('list')}
        >
          <i className="fa-solid fa-list" /> Kelola Subscriber ({subscribers.length})
        </button>
        <button
          className={`admin-tab-btn ${activeSubTab === 'broadcast' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('broadcast')}
        >
          <i className="fa-solid fa-paper-plane" /> Kirim Broadcast
        </button>
      </div>

      {/* ── Sub-Tab Content: List ── */}
      {activeSubTab === 'list' && (
        <>
          {/* Search control */}
          <div className="admin-card" style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Cari alamat email subscriber..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', background: 'transparent' }}
              />
            </div>
          </div>

          {/* Subscribers Table Card */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h2 className="admin-card__title">Daftar Subscriber ({filteredSubscribers.length})</h2>
            </div>
            <div className="admin-card__body" style={{ padding: 0 }}>
              <div className="admin-table-wrapper">
                {filteredSubscribers.length > 0 ? (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Alamat Email</th>
                        <th>Tanggal Berlangganan</th>
                        <th style={{ textAlign: 'right' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubscribers.map((sub) => (
                        <tr key={sub._id}>
                          <td>
                            <strong style={{ color: 'var(--text-main)' }}>{sub.email}</strong>
                          </td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {new Date(sub.createdAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              className="admin-action-btn admin-action-btn--delete" 
                              title="Hapus Subscriber"
                              onClick={() => setDeleteConfirmId(sub._id)}
                            >
                              <i className="fa-solid fa-trash" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="admin-empty-state" style={{ padding: '4rem 2rem' }}>
                    <i className="fa-regular fa-envelope" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
                    <p style={{ fontWeight: '500' }}>Tidak ada subscriber ditemukan</p>
                    <p className="admin-text-muted" style={{ fontSize: '0.9rem' }}>Daftar akan muncul ketika ada warga yang berlangganan newsletter.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Sub-Tab Content: Broadcast ── */}
      {activeSubTab === 'broadcast' && (
        <div className="admin-grid-2" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
          {/* Email Composer Form */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h2 className="admin-card__title">
                <i className="fa-solid fa-envelope-open-text" /> Tulis Pesan Massal
              </h2>
            </div>
            <div className="admin-card__body">
              {broadcastSuccess && (
                <div className="admin-alert" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.15)', marginBottom: '1.5rem' }}>
                  <i className="fa-solid fa-circle-check" />
                  <span>{broadcastSuccess}</span>
                </div>
              )}

              {broadcastError && (
                <div className="admin-alert admin-alert--error" style={{ marginBottom: '1.5rem' }}>
                  <i className="fa-solid fa-circle-exclamation" />
                  <span>{broadcastError}</span>
                </div>
              )}

              <form onSubmit={handleBroadcastSubmit}>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="broadcast-subject">Subjek Email</label>
                  <input
                    id="broadcast-subject"
                    type="text"
                    className="admin-form-control"
                    required
                    placeholder="Contoh: Pengumuman Rapat Bulanan Pemuda Rawa Arum"
                    value={broadcastForm.subject}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, subject: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="broadcast-content">Isi Pengumuman / Pesan</label>
                  <textarea
                    id="broadcast-content"
                    className="admin-form-control"
                    required
                    rows="10"
                    placeholder="Tuliskan berita lengkap, agenda kegiatan, atau buletin yang ingin disebarkan secara detail..."
                    value={broadcastForm.content}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, content: e.target.value })}
                  />
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <button
                    type="submit"
                    className="admin-btn admin-btn--primary"
                    disabled={broadcasting || subscribers.length === 0}
                  >
                    {broadcasting ? (
                      <><i className="fa-solid fa-spinner fa-spin" /> Sedang Mengirim...</>
                    ) : (
                      <><i className="fa-solid fa-paper-plane" /> Sebarkan ke {subscribers.length} Email</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Broadcast Information Tip Card */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h2 className="admin-card__title">
                <i className="fa-solid fa-circle-info" /> Panduan Broadcast
              </h2>
            </div>
            <div className="admin-card__body" style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '1rem' }}>Fitur ini akan mengirimkan email secara serentak ke seluruh alamat email yang terdaftar sebagai subscriber newsletter.</p>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li>
                  <strong>BCC Protection</strong>: Seluruh email dikirimkan menggunakan header <code>bcc</code> (blind carbon copy) sehingga pelanggan tidak dapat melihat email satu sama lain (menjaga privasi).
                </li>
                <li>
                  <strong>Konfigurasi Server</strong>: Pastikan file <code>server/.env</code> di sisi backend telah berisi akun SMTP pengirim (seperti Gmail App Password) yang aktif agar proses broadcast berhasil.
                </li>
                <li>
                  <strong>Format HTML</strong>: Teks baris baru yang Anda ketik akan otomatis diubah menjadi layout HTML email resmi Karang Taruna Kelurahan Rawa Arum.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal--sm">
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">Hapus Subscriber</h2>
              <button className="admin-modal__close" onClick={() => setDeleteConfirmId(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="admin-modal__body" style={{ padding: '1.5rem' }}>
              <p>Apakah Anda yakin ingin menghapus email ini dari daftar subscriber newsletter?</p>
              <div className="admin-modal__footer" style={{ marginTop: '1.5rem', padding: 0, border: 'none' }}>
                <button 
                  className="admin-btn admin-btn--outline" 
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={deleting}
                >
                  Batal
                </button>
                <button 
                  className="admin-btn admin-btn--danger" 
                  onClick={() => handleDelete(deleteConfirmId)}
                  disabled={deleting}
                >
                  {deleting ? (
                    <><i className="fa-solid fa-spinner fa-spin" /> Menghapus...</>
                  ) : (
                    'Ya, Hapus'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriberPage;
