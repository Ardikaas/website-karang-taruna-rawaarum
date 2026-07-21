import React from 'react';

const AdminPortalModal = ({
  isOpen,
  onClose,
  authenticated,
  password,
  setPassword,
  onLoginSubmit,
  onLogout,
  activeTab,
  setActiveTab,
  registeredMembers,
  newsletterSubscribers,
  newItemForm,
  setNewItemForm,
  onNewItemSubmit,
  newItemSubmitting
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay open">
      <div className="modal-container admin-modal">
        <div className="modal-header">
          <h3 className="modal-title">Portal Database Administrator (MERN)</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="modal-body">
          {!authenticated ? (
            // Login view
            <form onSubmit={onLoginSubmit} style={{ maxWidth: '400px', margin: '2rem auto' }}>
              <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                Akses khusus Pengurus Karang Taruna Kelurahan Rawa Arum.
              </p>
              <div className="form-group">
                <label className="form-label">Password Admin</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Masukkan password database..." 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                  Hint: Gunakan password <strong>admin123</strong> untuk demo.
                </small>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: '8px' }}>
                Buka Portal Admin
              </button>
            </form>
          ) : (
            // Authenticated Admin Dashboard view
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div className="admin-tabs">
                  <button 
                    className={`admin-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
                    onClick={() => setActiveTab('members')}
                  >
                    Pendaftaran Anggota ({registeredMembers.length})
                  </button>
                  <button 
                    className={`admin-tab-btn ${activeTab === 'newsletter' ? 'active' : ''}`}
                    onClick={() => setActiveTab('newsletter')}
                  >
                    Subscribers ({newsletterSubscribers.length})
                  </button>
                  <button 
                    className={`admin-tab-btn ${activeTab === 'add_item' ? 'active' : ''}`}
                    onClick={() => setActiveTab('add_item')}
                  >
                    + Terbitkan Info
                  </button>
                </div>
                <button className="btn btn-outline" style={{ borderRadius: '8px', padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={onLogout}>
                  Logout
                </button>
              </div>

              {/* Members registered list */}
              {activeTab === 'members' && (
                <div className="table-wrapper">
                  {registeredMembers.length > 0 ? (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Nama</th>
                          <th>Email</th>
                          <th>Telepon</th>
                          <th>Minat</th>
                          <th>Alasan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registeredMembers.map((m) => (
                          <tr key={m._id}>
                            <td><strong>{m.name}</strong></td>
                            <td>{m.email}</td>
                            <td>{m.phone}</td>
                            <td>
                              <span style={{ fontSize: '0.8rem', background: 'var(--accent-light)', color: 'var(--accent)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                                {m.interest}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{m.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Belum ada anggota baru yang terdaftar di database.
                    </div>
                  )}
                </div>
              )}

              {/* Newsletter subscribers list */}
              {activeTab === 'newsletter' && (
                <div className="table-wrapper">
                  {newsletterSubscribers.length > 0 ? (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Alamat Email</th>
                          <th>Tanggal Sign Up</th>
                        </tr>
                      </thead>
                      <tbody>
                        {newsletterSubscribers.map((sub) => (
                          <tr key={sub._id}>
                            <td><strong>{sub.email}</strong></td>
                            <td>{new Date(sub.createdAt).toLocaleString('id-ID')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Belum ada subscriber newsletter di database.
                    </div>
                  )}
                </div>
              )}

              {/* Add info item form */}
              {activeTab === 'add_item' && (
                <form onSubmit={onNewItemSubmit}>
                  <div className="grid-pilar" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0' }}>
                    <div className="form-group">
                      <label className="form-label">Judul Informasi / Kegiatan</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        required 
                        placeholder="Contoh: Rapat Koordinasi Agustusan"
                        value={newItemForm.title}
                        onChange={(e) => setNewItemForm({ ...newItemForm, title: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Kategori</label>
                      <select 
                        className="form-control"
                        value={newItemForm.type}
                        onChange={(e) => setNewItemForm({ ...newItemForm, type: e.target.value })}
                      >
                        <option value="kegiatan">Kegiatan</option>
                        <option value="loker">Loker</option>
                        <option value="umkm">UMKM</option>
                        <option value="pengumuman">Penting (Pengumuman)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Deskripsi Singkat</label>
                    <textarea 
                      className="form-control" 
                      required 
                      placeholder="Tuliskan berita lengkap atau rincian kegiatan..."
                      value={newItemForm.description}
                      onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                    />
                  </div>

                  <div className="grid-pilar" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0' }}>
                    <div className="form-group">
                      <label className="form-label">Custom Image URL (Kosongkan untuk default type ilustrasi)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="/assets/custom-img.png"
                        value={newItemForm.imageUrl}
                        onChange={(e) => setNewItemForm({ ...newItemForm, imageUrl: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Teks Tombol Aksi</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Lihat Detail / Lihat Lowongan / dsb."
                        value={newItemForm.linkText}
                        onChange={(e) => setNewItemForm({ ...newItemForm, linkText: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" style={{ borderRadius: '8px', padding: '0.6rem 1.5rem' }} disabled={newItemSubmitting}>
                      {newItemSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Terbitkan Sekarang'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPortalModal;
