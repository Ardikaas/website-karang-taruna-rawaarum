import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getRoleConfig } from '../../constants/roles';
import UserDashboardLayout from '../../components/UserDashboardLayout';

const PengurusDashboardPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const roleConfig = getRoleConfig(user?.role);

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'proker' | 'absensi' | 'laporan'

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Ardika Aji Setiawan',
    username: user?.username || 'ardika aji setiawan',
    email: 'ardika.setiawan@karangtarunarawaarum.id',
    phone: '0812-9876-5432',
    jabatan: 'Pengurus Karang Taruna Rawa Arum',
    bio: 'Aktif berkontribusi dalam pengembangan potensi pemuda dan kegiatan sosial kemasyarakatan Kelurahan Rawa Arum.',
  });

  const [submittingProfile, setSubmittingProfile] = useState(false);

  // Dummy data for Proker Saya
  const myTasks = [
    {
      id: 1,
      title: 'Koordinasi Pelatihan UMKM Pemuda Rawa Arum',
      kategori: 'Pemberdayaan Ekonomi',
      deadline: '30 Juli 2026',
      progress: 85,
      status: 'Berjalan',
      badgeClass: 'admin-badge--accent-light',
    },
    {
      id: 2,
      title: 'Turnamen Futsal Pemuda Antar RW 2026',
      kategori: 'Olahraga & Seni',
      deadline: '15 Agustus 2026',
      progress: 50,
      status: 'Persiapan',
      badgeClass: 'admin-badge--warning',
    },
    {
      id: 3,
      title: 'Aksi Bersih Lingkungan & Penanaman Pohon',
      kategori: 'Sosial & Lingkungan',
      deadline: '05 September 2026',
      progress: 20,
      status: 'Direncanakan',
      badgeClass: 'admin-badge--success',
    },
  ];

  // Dummy data for Absensi & Kehadiran
  const attendanceHistory = [
    {
      id: 'ATT-101',
      event: 'Rapat Pleno Bulanan Pengurus',
      date: '20 Juli 2026 - 19:30 WIB',
      status: 'Hadir',
      location: 'Kantor Kelurahan Rawa Arum',
    },
    {
      id: 'ATT-102',
      event: 'Gotong Royong Kebersihan Lapangan',
      date: '12 Juli 2026 - 08:00 WIB',
      status: 'Hadir',
      location: 'Lapangan RW 03',
    },
    {
      id: 'ATT-103',
      event: 'Sosialisasi Bahaya Narkoba Bagi Pemuda',
      date: '01 Juli 2026 - 14:00 WIB',
      status: 'Izin',
      location: 'Aula Kelurahan',
    },
  ];

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setSubmittingProfile(true);
    setTimeout(() => {
      setSubmittingProfile(false);
      showSuccess(
        'Profil pengurus Anda berhasil diperbarui!',
        'Profil Disimpan'
      );
    }, 600);
  };

  const handleCheckIn = () => {
    showSuccess(
      'Absensi kehadiran berhasil dicatat untuk kegiatan hari ini!',
      'Absensi Berhasil'
    );
  };

  return (
    <UserDashboardLayout>
      <div className="admin-page-container">
        {/* Page Header */}
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Portal Pengurus</h1>
            <p className="admin-page-subtitle">
              Selamat datang kembali, {admin?.name || 'Ardika Aji Setiawan'}.
              Kelola profil dan agenda kegiatan Anda.
            </p>
          </div>
          <span className="admin-badge admin-badge--warning">
            <i className="fa-solid fa-user-shield" /> Peran: {roleConfig.label}
          </span>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className={`admin-btn ${activeTab === 'profile' ? 'admin-btn--primary' : 'admin-btn--outline'}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fa-solid fa-id-card" /> Profil Saya
          </button>
          <button
            type="button"
            className={`admin-btn ${activeTab === 'proker' ? 'admin-btn--primary' : 'admin-btn--outline'}`}
            onClick={() => setActiveTab('proker')}
          >
            <i className="fa-solid fa-list-check" /> Tugas & Proker (3)
          </button>
          <button
            type="button"
            className={`admin-btn ${activeTab === 'absensi' ? 'admin-btn--primary' : 'admin-btn--outline'}`}
            onClick={() => setActiveTab('absensi')}
          >
            <i className="fa-solid fa-calendar-check" /> Absensi Kehadiran
          </button>
          <button
            type="button"
            className={`admin-btn ${activeTab === 'laporan' ? 'admin-btn--primary' : 'admin-btn--outline'}`}
            onClick={() => setActiveTab('laporan')}
          >
            <i className="fa-solid fa-file-lines" /> Catatan Kegiatan
          </button>
        </div>

        {/* Tab Content 1: Profil Saya */}
        {activeTab === 'profile' && (
          <div className="admin-card admin-fade-in">
            <div className="admin-card__header">
              <h2 className="admin-card__title">Pengaturan Profil Pengurus</h2>
            </div>
            <div className="admin-card__body">
              <form onSubmit={handleProfileSubmit}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      <i className="fa-solid fa-user" /> Nama Lengkap
                    </label>
                    <input
                      type="text"
                      className="admin-form-control"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      <i className="fa-solid fa-at" /> Username / Akun Login
                    </label>
                    <input
                      type="text"
                      className="admin-form-control"
                      value={profileForm.username}
                      disabled
                      style={{
                        backgroundColor: '#f1f5f9',
                        cursor: 'not-allowed',
                      }}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      <i className="fa-solid fa-envelope" /> Alamat Email
                    </label>
                    <input
                      type="email"
                      className="admin-form-control"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      <i className="fa-solid fa-phone" /> Nomor WhatsApp /
                      Telepon
                    </label>
                    <input
                      type="text"
                      className="admin-form-control"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          phone: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div
                  className="admin-form-group"
                  style={{ marginTop: '1.25rem' }}
                >
                  <label className="admin-form-label">
                    <i className="fa-solid fa-briefcase" /> Jabatan / Posisi
                  </label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={profileForm.jabatan}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        jabatan: e.target.value,
                      })
                    }
                  />
                </div>

                <div
                  className="admin-form-group"
                  style={{ marginTop: '1.25rem' }}
                >
                  <label className="admin-form-label">
                    <i className="fa-solid fa-quote-left" /> Bio & Ringkasan
                    Kontribusi
                  </label>
                  <textarea
                    rows="3"
                    className="admin-form-control"
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, bio: e.target.value })
                    }
                  />
                </div>

                <div
                  style={{
                    marginTop: '1.5rem',
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    type="submit"
                    className="admin-btn admin-btn--primary"
                    disabled={submittingProfile}
                  >
                    {submittingProfile ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin" />{' '}
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-floppy-disk" /> Simpan
                        Perubahan Profil
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab Content 2: Tugas & Proker */}
        {activeTab === 'proker' && (
          <div className="admin-card admin-fade-in">
            <div
              className="admin-card__header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 className="admin-card__title">Program Kerja & Tugas Saya</h2>
              <button
                type="button"
                className="admin-btn admin-btn--primary admin-btn--sm"
                onClick={() =>
                  showError(
                    'Fitur penambahan tugas baru akan dibuka oleh Admin.',
                    'Informasi'
                  )
                }
              >
                <i className="fa-solid fa-plus" /> Tambah Tugas
              </button>
            </div>
            <div className="admin-card__body">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {myTasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '1.25rem',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: 'var(--accent)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {task.kategori}
                        </span>
                        <h3
                          style={{
                            fontSize: '1rem',
                            fontWeight: 800,
                            color: '#1e293b',
                            margin: '0.2rem 0 0',
                          }}
                        >
                          {task.title}
                        </h3>
                      </div>
                      <span className={`admin-badge ${task.badgeClass}`}>
                        {task.status}
                      </span>
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.78rem',
                          color: '#64748b',
                          marginBottom: '0.3rem',
                        }}
                      >
                        <span>Progres Pelaksanaan</span>
                        <strong>{task.progress}%</strong>
                      </div>
                      <div
                        style={{
                          height: '8px',
                          background: '#e2e8f0',
                          borderRadius: '50px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            background: 'var(--accent)',
                            width: `${task.progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem',
                        color: '#64748b',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #edf2f7',
                      }}
                    >
                      <span>
                        <i className="fa-solid fa-calendar-day" /> Tenggat:{' '}
                        {task.deadline}
                      </span>
                      <button
                        type="button"
                        className="admin-btn admin-btn--outline admin-btn--sm"
                        onClick={() =>
                          showSuccess(
                            `Rincian tugas "${task.title}" siap diperbarui.`,
                            'Detail Proker'
                          )
                        }
                      >
                        <i className="fa-solid fa-pen-to-square" /> Update
                        Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: Absensi */}
        {activeTab === 'absensi' && (
          <div className="admin-card admin-fade-in">
            <div
              className="admin-card__header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 className="admin-card__title">Absensi Kehadiran Pengurus</h2>
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={handleCheckIn}
              >
                <i className="fa-solid fa-qrcode" /> Check-in Kehadiran
              </button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Kode Event</th>
                    <th>Nama Kegiatan</th>
                    <th>Waktu & Tanggal</th>
                    <th>Lokasi</th>
                    <th>Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <code>{row.id}</code>
                      </td>
                      <td>
                        <strong>{row.event}</strong>
                      </td>
                      <td>{row.date}</td>
                      <td>{row.location}</td>
                      <td>
                        <span
                          className={`admin-badge ${row.status === 'Hadir' ? 'admin-badge--success' : 'admin-badge--warning'}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content 4: Catatan Kegiatan */}
        {activeTab === 'laporan' && (
          <div className="admin-card admin-fade-in">
            <div
              className="admin-card__header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 className="admin-card__title">Catatan & Laporan Lapangan</h2>
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={() =>
                  showSuccess(
                    'Form laporan kegiatan lapangan siap diisi.',
                    'Buat Laporan'
                  )
                }
              >
                <i className="fa-solid fa-file-circle-plus" /> Tulis Laporan
                Baru
              </button>
            </div>
            <div className="admin-card__body">
              <div className="admin-empty-state">
                <i
                  className="fa-solid fa-folder-open"
                  style={{
                    fontSize: '2.5rem',
                    color: '#94a3b8',
                    marginBottom: '1rem',
                  }}
                />
                <h4
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#1e293b',
                    marginBottom: '0.35rem',
                  }}
                >
                  Belum Ada Laporan Lapangan
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Gunakan tombol "Tulis Laporan Baru" di atas untuk
                  mendokumentasikan kegiatan sosial dan lapangan.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
};

export default PengurusDashboardPage;
