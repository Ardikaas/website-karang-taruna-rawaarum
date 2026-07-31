const BirthdayBanner = ({ data }) => {
  if (!data || !data.isActive || !data.name) {
    return null;
  }

  const defaultPhoto = '/assets/potensi_umkm.png';
  const photo = data.photoUrl || defaultPhoto;

  const waNumber = (data.whatsapp || '').replace(/[^0-9]/g, '');
  const waUrl = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
        `Selamat Ulang Tahun ${data.name}! Semoga panjang umur, sehat selalu, dan semakin sukses.`
      )}`
    : null;

  return (
    <section className="birthday-section">
      {/* Background Animated Floating Sparkles */}
      <div className="birthday-bg-particles" aria-hidden="true">
        <span className="bday-particle p1">✦</span>
        <span className="bday-particle p2">✦</span>
        <span className="bday-particle p3">✦</span>
        <span className="bday-particle p4">✦</span>
        <span className="bday-particle p5">✦</span>
        <span className="bday-particle p6">✦</span>
      </div>

      <div className="container">
        <div className="birthday-card">
          {/* Continuous Shimmer Light Sweep Overlay */}
          <div className="birthday-shimmer-sweep" aria-hidden="true" />

          {/* Top Tag Header */}
          <div className="birthday-card-header">
            <span className="birthday-tag">
              <i className="fa-solid fa-cake-candles" /> Momentum Ulang Tahun
              Pengurus
            </span>
          </div>

          <div className="birthday-card-content">
            {/* Left: Avatar Ring with Continuous Glow Pulse */}
            <div className="birthday-avatar-col">
              <div className="birthday-avatar-ring">
                <div className="birthday-avatar-glow-ring" />
                <img
                  src={photo}
                  alt={data.name}
                  className="birthday-avatar-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = defaultPhoto;
                  }}
                />
              </div>
            </div>

            {/* Right: Info & Message */}
            <div className="birthday-info-col">
              <h3 className="birthday-name">{data.name}</h3>

              {data.role && (
                <div className="birthday-role">
                  <i className="fa-solid fa-user-shield" /> {data.role}
                </div>
              )}

              <div className="birthday-message-box">
                <i className="fa-solid fa-quote-left birthday-quote-icon" />
                <p className="birthday-message-text">
                  {data.message ||
                    'Selamat Ulang Tahun! Semoga senantiasa melangkah dalam keberkahan, kesehatan, dan kesuksesan.'}
                </p>
              </div>

              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="birthday-wa-button"
                >
                  <i className="fa-brands fa-whatsapp" /> Kirim Ucapan Selamat
                  via WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BirthdayBanner;
