import React from 'react';

const RegistrationModal = ({ 
  isOpen, 
  onClose, 
  regForm, 
  setRegForm, 
  onSubmit, 
  submitting 
}) => {
  if (!isOpen) return null;

  return (
    <div className={`modal-overlay open`}>
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Formulir Pendaftaran Pemuda</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input 
                type="text" 
                className="form-control" 
                required 
                placeholder="Contoh: Ahmad Hidayat"
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Alamat Email</label>
              <input 
                type="email" 
                className="form-control" 
                required 
                placeholder="name@example.com"
                value={regForm.email}
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nomor Telepon (WhatsApp)</label>
              <input 
                type="tel" 
                className="form-control" 
                required 
                placeholder="0812xxxxxxxx"
                value={regForm.phone}
                onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bidang Minat & Bakat</label>
              <select 
                className="form-control"
                value={regForm.interest}
                onChange={(e) => setRegForm({ ...regForm, interest: e.target.value })}
              >
                <option>Sosial & Keagamaan</option>
                <option>Olahraga & Seni Budaya</option>
                <option>UMKM & Kewirausahaan</option>
                <option>Teknologi & Informasi</option>
                <option>Humas & Kemitraan</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Alasan Bergabung</label>
              <textarea 
                className="form-control" 
                required 
                placeholder="Tuliskan motivasi Anda bergabung dengan Karang Taruna..."
                value={regForm.reason}
                onChange={(e) => setRegForm({ ...regForm, reason: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ borderRadius: '8px', padding: '0.6rem 1.25rem' }} 
                onClick={onClose}
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ borderRadius: '8px', padding: '0.6rem 1.25rem' }} 
                disabled={submitting}
              >
                {submitting ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Kirim Pendaftaran'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;
