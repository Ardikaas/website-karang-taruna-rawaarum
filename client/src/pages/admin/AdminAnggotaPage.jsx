import { useState, useEffect } from 'react';
import { fetchRegistrations, deleteRegistration, updateRegistrationStatus } from '../../services/api';

const AdminAnggotaPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterInterest, setFilterInterest] = useState('all');

  // Modal / Detail view
  const [selectedMember, setSelectedMember] = useState(null);

  // Status updating state
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await fetchRegistrations();
      setMembers(data);
    } catch (err) {
      setError('Gagal mengambil data registrasi anggota.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteRegistration(id);
      setDeleteConfirmId(null);
      if (selectedMember && selectedMember._id === id) {
        setSelectedMember(null);
      }
      loadMembers();
    } catch (err) {
      alert(err.message || 'Gagal menghapus data.');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setStatusUpdating(true);
    try {
      const updated = await updateRegistrationStatus(id, newStatus);
      
      // Update selected member view in modal
      if (selectedMember && selectedMember._id === id) {
        setSelectedMember(updated);
      }
      
      // Reload lists
      const freshData = await fetchRegistrations();
      setMembers(freshData);
    } catch (err) {
      alert(err.message || 'Gagal mengubah status pendaftar.');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Get unique list of interests for filter dropdown
  const interestsList = ['all', ...new Set(members.map(m => m.interest))];

  // Filtering logic
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search);
    
    const matchesInterest = filterInterest === 'all' || m.interest === filterInterest;
    
    return matchesSearch && matchesInterest;
  });

  const exportToCSV = () => {
    if (filteredMembers.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    const headers = ['Nama', 'Email', 'No. Telepon', 'Minat Divisi', 'Status', 'Tanggal Daftar'];
    const rows = filteredMembers.map(m => [
      m.name,
      m.email,
      m.phone,
      m.interest,
      m.status || 'Pending',
      new Date(m.createdAt).toLocaleString('id-ID')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Daftar_Pendaftar_Kartar_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && members.length === 0) {
    return (
      <div className="admin-loading-container">
        <i className="fa-solid fa-spinner fa-spin admin-spinner" />
        <p>Memuat data pendaftar...</p>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Pendaftaran Anggota</h1>
          <p className="admin-page-subtitle">Kelola data pemuda kelurahan yang mendaftar menjadi anggota Karang Taruna.</p>
        </div>
        <button className="admin-btn admin-btn--outline" onClick={exportToCSV}>
          <i className="fa-solid fa-file-excel" style={{ color: '#10b981' }} /> Ekspor CSV
        </button>
      </div>

      {error && (
        <div className="admin-alert admin-alert--error" style={{ marginBottom: '1.5rem' }}>
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="admin-grid-2" style={{ gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="admin-card" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Cari nama, email, atau no telepon..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', background: 'transparent' }}
            />
          </div>
        </div>

        <div className="admin-card" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-filter" style={{ color: 'var(--text-muted)' }} />
            <select
              value={filterInterest}
              onChange={(e) => setFilterInterest(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', background: 'transparent', cursor: 'pointer' }}
            >
              <option value="all">Semua Minat</option>
              {interestsList.filter(i => i !== 'all').map(interest => (
                <option key={interest} value={interest}>{interest}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Members Card */}
      <div className="admin-card">
        <div className="admin-card__header" style={{ justifyContent: 'space-between' }}>
          <h2 className="admin-card__title">Daftar Registrasi ({filteredMembers.length})</h2>
        </div>
        <div className="admin-card__body" style={{ padding: 0 }}>
          <div className="admin-table-wrapper">
            {filteredMembers.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Telepon</th>
                    <th>Minat Divisi</th>
                    <th>Status</th>
                    <th>Tanggal Daftar</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m) => (
                    <tr key={m._id}>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{m.name}</strong>
                      </td>
                      <td>{m.email}</td>
                      <td>{m.phone}</td>
                      <td>
                        <span className="admin-badge admin-badge--accent-light">
                          {m.interest}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${
                          m.status === 'Approved' ? 'success' :
                          m.status === 'Rejected' ? 'error' :
                          'warning'
                        }`}>
                          {m.status || 'Pending'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(m.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button 
                            className="admin-action-btn admin-action-btn--edit" 
                            title="Detail"
                            onClick={() => setSelectedMember(m)}
                          >
                            <i className="fa-solid fa-eye" />
                          </button>
                          <button 
                            className="admin-action-btn admin-action-btn--delete" 
                            title="Hapus"
                            onClick={() => setDeleteConfirmId(m._id)}
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty-state" style={{ padding: '4rem 2rem' }}>
                <i className="fa-solid fa-users-slash" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <p style={{ fontWeight: '500' }}>Tidak ada pendaftar ditemukan</p>
                <p className="admin-text-muted" style={{ fontSize: '0.9rem' }}>Cobalah mencari dengan kata kunci atau filter lain.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">Detail Pendaftar</h2>
              <button className="admin-modal__close" onClick={() => setSelectedMember(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="admin-modal__body" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1.5rem' }}>
                <div style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Nama Lengkap</div>
                <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{selectedMember.name}</div>
                
                <div style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Alamat Email</div>
                <div>{selectedMember.email}</div>
                
                <div style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Nomor Whatsapp</div>
                <div>{selectedMember.phone}</div>
                
                <div style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Minat Bidang / Pilar</div>
                <div>
                  <span className="admin-badge admin-badge--accent-light">
                    {selectedMember.interest}
                  </span>
                </div>

                <div style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Status Kelulusan</div>
                <div>
                  <span className={`admin-badge admin-badge--${
                    selectedMember.status === 'Approved' ? 'success' :
                    selectedMember.status === 'Rejected' ? 'error' :
                    'warning'
                  }`}>
                    {selectedMember.status || 'Pending'}
                  </span>
                </div>

                <div style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Tanggal Daftar</div>
                <div>{new Date(selectedMember.createdAt).toLocaleString('id-ID')}</div>
              </div>

              <div>
                <div style={{ fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Alasan & Motivasi Bergabung</div>
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '6px', fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                  {selectedMember.reason}
                </div>
              </div>

              {/* Status Update & Messaging Actions */}
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.5rem' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>Kelola Pendaftaran (Alur Kerja)</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="admin-btn admin-btn--outline"
                    style={{ borderColor: '#10b981', color: '#10b981', backgroundColor: selectedMember.status === 'Approved' ? 'rgba(16, 185, 129, 0.05)' : '' }}
                    onClick={() => handleUpdateStatus(selectedMember._id, 'Approved')}
                    disabled={statusUpdating || selectedMember.status === 'Approved'}
                  >
                    <i className="fa-solid fa-circle-check" /> Setujui Anggota
                  </button>
                  <button
                    className="admin-btn admin-btn--outline"
                    style={{ borderColor: '#ef4444', color: '#ef4444', backgroundColor: selectedMember.status === 'Rejected' ? 'rgba(239, 68, 68, 0.05)' : '' }}
                    onClick={() => handleUpdateStatus(selectedMember._id, 'Rejected')}
                    disabled={statusUpdating || selectedMember.status === 'Rejected'}
                  >
                    <i className="fa-solid fa-circle-xmark" /> Tolak Pendaftaran
                  </button>
                  {selectedMember.status !== 'Pending' && (
                    <button
                      className="admin-btn admin-btn--outline"
                      onClick={() => handleUpdateStatus(selectedMember._id, 'Pending')}
                      disabled={statusUpdating}
                    >
                      <i className="fa-solid fa-clock-rotate-left" /> Kembalikan ke Pending
                    </button>
                  )}
                </div>
              </div>

              <div className="admin-modal__footer" style={{ marginTop: '2rem', paddingBottom: 0, border: 'none' }}>
                <button 
                  className="admin-btn admin-btn--outline" 
                  onClick={() => setSelectedMember(null)}
                >
                  Tutup
                </button>
                <a 
                  href={`https://wa.me/${selectedMember.phone.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="admin-btn admin-btn--primary"
                >
                  <i className="fa-brands fa-whatsapp" /> Hubungi via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal--sm">
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">Konfirmasi Hapus</h2>
              <button className="admin-modal__close" onClick={() => setDeleteConfirmId(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="admin-modal__body" style={{ padding: '1.5rem' }}>
              <p>Apakah Anda yakin ingin menghapus pendaftar ini dari database?</p>
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

export default AdminAnggotaPage;
