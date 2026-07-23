import { useState, useEffect } from 'react';
import { fetchSiteSettings } from '../services/api';

const KontakPage = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadSettings = async () => {
      const data = await fetchSiteSettings();
      setSettings(data);
    };
    loadSettings();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Kemitraan & Sponsorship',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Kemitraan & Sponsorship',
        message: ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappNum = settings?.whatsapp || '6281234567890';
  const address = settings?.address || 'Kantor Kelurahan Rawa Arum, Kec. Grogol, Kota Cilegon, Banten 42436';
  const email = settings?.email || 'kontak@karangtarunarawaarum.id';
  const mapsEmbed = settings?.mapsEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15871.218525368565!2d106.01511252119934!3d-6.021111082260655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e418fb5f03e2307%3A0xe1cc64e9a0de5f55!2sRawa%20Arum%2C%20Kec.%20Grogol%2C%20Kota%20Cilegon%2C%20Banten!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid';

  const contactOptions = [
    {
      icon: 'fa-solid fa-handshake',
      title: 'Kolaborasi & Sponsor',
      desc: 'Diskusikan program sponsorship, kemitraan industri, CSR, atau showcase UMKM.',
      actionText: 'Hubungi Humas via WA',
      link: `https://wa.me/${whatsappNum}`,
      badge: 'B2B & CSR'
    },
    {
      icon: 'fa-solid fa-bullhorn',
      title: 'Aduan & Layanan',
      desc: 'Sampaikan saran, masukan, pengaduan sosial, atau kebutuhan administrasi kepemudaan.',
      actionText: 'Layanan WhatsApp',
      link: `https://wa.me/${whatsappNum}`,
      badge: 'Warga Rawa Arum'
    }
  ];

  return (
    <div className="subpage-layout">
      {/* Background glow patterns */}
      <div className="subpage-bg-glow"></div>

      <div className="container subpage-container">
        {/* Header */}
        <div className="subpage-header text-center">
          <div className="section-header" data-watermark="CONTACT">
            <span className="section-tag">HUBUNGI KAMI</span>
            <h1 className="section-title">Kontak & Hubungan Sinergis</h1>
            <div className="title-underline" style={{ margin: '0.5rem auto 1.25rem' }}></div>
          </div>
          <p className="subpage-intro" style={{ margin: '0 auto', maxWidth: '600px' }}>
            Hubungkan gagasan Anda dengan Karang Taruna Kelurahan Rawa Arum. Kami siap berkolaborasi untuk menciptakan dampak sosial dan kemajuan daerah yang nyata.
          </p>
        </div>

        {/* Section 1: Quick Channels */}
        <div className="org-block" style={{ marginTop: '3.5rem' }}>
          <div className="contact-quick-grid">
            {contactOptions.map((opt, idx) => (
              <div key={idx} className="quick-contact-card">
                <span className="quick-badge">{opt.badge}</span>
                <div className="quick-icon-box">
                  <i className={opt.icon}></i>
                </div>
                <h3 className="quick-card-title">{opt.title}</h3>
                <p className="quick-card-desc">{opt.desc}</p>
                <a href={opt.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                  <i className="fa-brands fa-whatsapp"></i> {opt.actionText}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Contact Form & Info Grid */}
        <div className="org-block">
          <div className="contact-form-layout">
            
            {/* Form Column */}
            <div className="contact-form-card">
              <h2 className="form-card-title">Kirimkan Pesan Anda</h2>
              <p className="form-card-desc">Silakan lengkapi formulir di bawah ini, tim sekretariat kami akan memberikan tanggapan resmi maksimal dalam waktu 1x24 jam.</p>
              
              {success ? (
                <div className="contact-success-state">
                  <div className="success-icon-badge">
                    <i className="fa-solid fa-circle-check"></i>
                  </div>
                  <h3>Pesan Terkirim Sukses!</h3>
                  <p>Terima kasih telah menghubungi kami. Tim Karang Taruna Rawa Arum akan segera menanggapi pesan Anda melalui email atau WhatsApp.</p>
                  <button onClick={() => setSuccess(false)} className="btn btn-outline btn-sm">
                    Kirim Pesan Lainnya
                  </button>
                </div>
              ) : (
                <form className="premium-contact-form" onSubmit={handleSubmit}>
                  <div className="form-row-2">
                    <div className="form-group-premium">
                      <label htmlFor="name">Nama Lengkap</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        placeholder="Masukkan nama lengkap..." 
                        required 
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group-premium">
                      <label htmlFor="email">Alamat Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        placeholder="Contoh: nama@domain.com" 
                        required 
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group-premium">
                      <label htmlFor="phone">No. WhatsApp</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        placeholder="Contoh: 0812xxxxxxxx" 
                        required 
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group-premium">
                      <label htmlFor="subject">Kebutuhan Utama</label>
                      <select 
                        id="subject" 
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                      >
                        <option value="Kemitraan & Sponsorship">Kemitraan & Sponsorship (B2B)</option>
                        <option value="Aduan & Layanan Masyarakat">Aduan & Layanan Masyarakat</option>
                        <option value="Kerja Sama Kreatif & Publikasi">Kerja Sama Kreatif & Publikasi</option>
                        <option value="Pertanyaan Umum">Pertanyaan Umum</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group-premium">
                    <label htmlFor="message">Isi Pesan / Keperluan</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      rows="5" 
                      placeholder="Tuliskan keperluan kolaborasi atau pengaduan secara mendetail..." 
                      required
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                    {submitting ? (
                      <span><i className="fa-solid fa-spinner fa-spin"></i> Sedang Mengirim...</span>
                    ) : (
                      <span><i className="fa-solid fa-paper-plane"></i> Kirim Formulir Kerja Sama</span>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Info Column */}
            <div className="contact-info-card">
              <div className="info-item-box">
                <h3 className="info-box-title">Sekretariat Karang Taruna</h3>
                <div className="info-detail-row">
                  <div className="info-detail-icon"><i className="fa-solid fa-location-dot"></i></div>
                  <div className="info-detail-text">
                    <strong>Alamat Kantor</strong>
                    <span>{address}</span>
                  </div>
                </div>
                <div className="info-detail-row">
                  <div className="info-detail-icon"><i className="fa-solid fa-envelope"></i></div>
                  <div className="info-detail-text">
                    <strong>Email Resmi</strong>
                    <a href={`mailto:${email}`}>{email}</a>
                  </div>
                </div>
                <div className="info-detail-row">
                  <div className="info-detail-icon"><i className="fa-solid fa-clock"></i></div>
                  <div className="info-detail-text">
                    <strong>Jam Pelayanan Publik</strong>
                    <span>Senin - Jumat: 08:00 - 16:00 WIB</span>
                  </div>
                </div>
              </div>

              {/* Map Iframe */}
              <div className="contact-map-wrapper">
                <iframe 
                  title="Peta Kantor Kelurahan Rawa Arum"
                  src={mapsEmbed}
                  width="100%" 
                  height="220" 
                  style={{ border: 0, borderRadius: 'var(--radius-md)' }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default KontakPage;
