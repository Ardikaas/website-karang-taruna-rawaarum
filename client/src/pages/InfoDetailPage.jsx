import { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  fetchInfoItemById,
  fetchInfoItems,
  fetchUmkms,
  incrementInfoView,
  formatImageUrl,
} from '../services/api';
import { useToast } from '../context/ToastContext';
import InfoCard from '../components/InfoCard';
import DocPreviewModal from '../components/DocPreviewModal';

const InfoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const [item, setItem] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [featuredUmkms, setFeaturedUmkms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Instant scroll reset before paint
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    fetchUmkms()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const shuffled = [...data]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
          setFeaturedUmkms(shuffled);
        }
      })
      .catch(() => {});
  }, []);
  const [firstAspect, setFirstAspect] = useState(null);

  // Construct images gallery array (imageUrl + images[])
  const gallery = [];
  if (item?.imageUrl) {
    gallery.push(item.imageUrl);
  }
  if (Array.isArray(item?.images)) {
    item.images.forEach((img) => {
      if (img && !gallery.includes(img)) {
        gallery.push(img);
      }
    });
  }

  // Preload 1st image to derive its natural aspect ratio
  useEffect(() => {
    if (gallery.length > 0 && gallery[0]) {
      const firstUrl = formatImageUrl(gallery[0]);
      const img = new Image();
      img.src = firstUrl;
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          setFirstAspect(img.naturalWidth / img.naturalHeight);
        }
      };
    }
  }, [gallery[0]]);

  // Auto-slide effect (3.5 sec looping interval)
  useEffect(() => {
    if (gallery.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % gallery.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [gallery.length, isHovered]);

  useEffect(() => {
    let intervalId;
    const startTime = Date.now();
    const MIN_LOADING_TIME = 1400; // Mandatory loading screen display for ~1.4 seconds

    const loadDetail = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const data = await fetchInfoItemById(id);

        let filteredRelated = [];
        if (data) {
          try {
            let all = await fetchInfoItems(
              data.type !== 'all' ? data.type : null
            );
            let filtered = (all || [])
              .filter((i) => String(i._id) !== String(data._id))
              .sort((a, b) => {
                const timeA =
                  new Date(a.createdAt || a.updatedAt || a.date).getTime() || 0;
                const timeB =
                  new Date(b.createdAt || b.updatedAt || b.date).getTime() || 0;
                return timeB - timeA;
              });

            if (filtered.length === 0) {
              const fallbackAll = await fetchInfoItems();
              filtered = (fallbackAll || [])
                .filter((i) => String(i._id) !== String(data._id))
                .sort((a, b) => {
                  const timeA =
                    new Date(a.createdAt || a.updatedAt || a.date).getTime() ||
                    0;
                  const timeB =
                    new Date(b.createdAt || b.updatedAt || b.date).getTime() ||
                    0;
                  return timeB - timeA;
                });
            }
            filteredRelated = filtered.slice(0, 4);
          } catch (_err) {
            filteredRelated = [];
          }
        }

        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

        setTimeout(() => {
          if (!data) {
            setNotFound(true);
            setLoading(false);
            return;
          }

          setItem(data);
          setRelatedItems(filteredRelated);
          document.title = `${data.title} - Karang Taruna Kelurahan Rawa Arum`;

          // Track view (deduplicated by session)
          incrementInfoView(id).then((res) => {
            if (res && res.viewsCount !== undefined) {
              setItem((prev) =>
                prev ? { ...prev, viewsCount: res.viewsCount } : prev
              );
            }
          });

          setLoading(false);
        }, remainingTime);
      } catch (_err) {
        setNotFound(true);
        setLoading(false);
      }
    };

    if (id) {
      loadDetail();

      // Polling views count update secara real-time (setiap 12 detik)
      intervalId = setInterval(async () => {
        const updated = await fetchInfoItemById(id);
        if (updated?.viewsCount !== undefined) {
          setItem((prev) =>
            prev ? { ...prev, viewsCount: updated.viewsCount } : prev
          );
        }
      }, 12000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: item?.title || 'Informasi Karang Taruna Rawa Arum',
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSuccess(
        'Tautan berita berhasil disalin ke clipboard!',
        'Tautan Disalin'
      );
    }
  };

  const getBadgeColorClass = (badgeStr, typeStr) => {
    if (
      typeStr === 'pengumuman' ||
      (badgeStr && badgeStr.toLowerCase().includes('penting'))
    ) {
      return 'warning';
    }
    return '';
  };

  const getContactConfig = () => {
    if (!item) return { isExternal: false, url: '/kontak', isWa: false };

    const type = item.contactType || (item.whatsapp ? 'whatsapp' : 'default');

    if (type === 'whatsapp') {
      const rawWa = item.whatsapp || '6281234567890';
      const cleanNum = rawWa.replace(/[^0-9]/g, '');
      const formattedNum = cleanNum.startsWith('0')
        ? '62' + cleanNum.slice(1)
        : cleanNum;

      const rawTemplate =
        item.whatsappText ||
        'Halo Admin Karang Taruna Rawa Arum, saya mau bertanya mengenai: {title}';
      const filledText = rawTemplate.replace('{title}', item.title || '');

      return {
        isExternal: true,
        url: `https://wa.me/${formattedNum}?text=${encodeURIComponent(filledText)}`,
        isWa: true,
      };
    }

    if (type === 'link' && item.contactUrl) {
      return {
        isExternal: true,
        url: item.contactUrl,
        isWa: false,
      };
    }

    return {
      isExternal: false,
      url: '/kontak',
      isWa: false,
    };
  };

  if (loading) {
    return (
      <div className="info-detail-loading-wrapper">
        <div className="info-detail-loading-screen">
          <div className="info-loading-content">
            <div className="info-loading-logo-wrapper">
              <div className="info-loading-ring"></div>
              <img
                src="/assets/karang-taruna-seeklogo.png"
                alt="Logo Karang Taruna Rawa Arum"
                className="info-loading-logo"
                loading="eager"
                decoding="sync"
              />
            </div>

            <div className="info-loading-text-group">
              <h2 className="info-loading-brand">KARANG TARUNA TUNAS ARUM</h2>
              <p className="info-loading-subtitle">
                Website Resmi Kelurahan Rawa Arum
              </p>

              <span className="info-loading-caption">
                Memuat berita &amp; informasi publik...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="subpage-layout">
        <div
          className="container"
          style={{ textAlign: 'center', padding: '4rem 1.5rem' }}
        >
          <i
            className="fa-solid fa-file-circle-exclamation"
            style={{
              fontSize: '4rem',
              color: 'var(--text-muted)',
              marginBottom: '1.5rem',
              opacity: 0.5,
            }}
          />
          <h2
            style={{
              fontSize: '1.8rem',
              fontWeight: 900,
              marginBottom: '0.75rem',
              color: 'var(--primary-deep)',
            }}
          >
            Informasi Tidak Ditemukan
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
              maxWidth: '500px',
              margin: '0 auto 2rem',
            }}
          >
            Maaf, halaman informasi atau berita yang Anda cari tidak ditemukan
            atau telah dihapus.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-primary"
            style={{ borderRadius: '50px', padding: '0.75rem 1.75rem' }}
          >
            <i
              className="fa-solid fa-arrow-left"
              style={{ marginRight: '8px' }}
            />{' '}
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subpage-layout">
      <div className="container" style={{ maxWidth: '920px' }}>
        {/* Breadcrumb & Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.75rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            <Link to="/" style={{ color: 'var(--text-muted)' }}>
              Beranda
            </Link>
            <i
              className="fa-solid fa-chevron-right"
              style={{ fontSize: '0.7rem' }}
            />
            <Link
              to={`/${item.type || 'kegiatan'}`}
              style={{
                color: 'var(--text-muted)',
                textTransform: 'capitalize',
              }}
            >
              {item.type || 'Informasi'}
            </Link>
            <i
              className="fa-solid fa-chevron-right"
              style={{ fontSize: '0.7rem' }}
            />
            <span
              style={{
                color: 'var(--accent)',
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '200px',
              }}
            >
              {item.title}
            </span>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline"
            style={{
              borderRadius: '50px',
              padding: '0.4rem 1.1rem',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fa-solid fa-arrow-left" /> Kembali
          </button>
        </div>

        {/* Article Header Header Header */}
        <article
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid rgba(11, 37, 69, 0.05)',
            marginBottom: '3rem',
          }}
        >
          {/* Badge & Meta Date */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            <span
              className={`info-tag-badge ${getBadgeColorClass(item.badge, item.type)}`}
              style={{ position: 'static' }}
            >
              {item.badge || item.type}
            </span>
            <span
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="fa-regular fa-calendar" />
              Dipublikasikan: {item.date}
            </span>
            <span
              style={{
                fontSize: '0.82rem',
                color: 'var(--primary-deep)',
                background: 'rgba(11, 37, 69, 0.05)',
                padding: '0.2rem 0.65rem',
                borderRadius: '50px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Jumlah Pembaca Real-time"
            >
              <i
                className="fa-solid fa-eye"
                style={{ color: 'var(--accent)' }}
              />
              {(item.viewsCount || 0).toLocaleString('id-ID')} Dilihat
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '1.95rem',
              fontWeight: 900,
              lineHeight: 1.3,
              color: 'var(--primary-deep)',
              marginBottom: '1.75rem',
              letterSpacing: '-0.3px',
            }}
          >
            {item.title}
          </h1>

          {/* Featured Image & Auto-Sliding Carousel */}
          {gallery.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() =>
                  setPreviewDoc({
                    title: `${item.title} (Foto ${currentSlide + 1}/${gallery.length})`,
                    fileUrl: formatImageUrl(gallery[currentSlide]),
                  })
                }
                title="Klik untuk memperbesar foto dalam tampilan Lightbox"
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '460px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Active Image */}
                <img
                  src={formatImageUrl(gallery[currentSlide])}
                  alt={`${item.title} - ${currentSlide + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: currentSlide === 0 ? 'cover' : 'contain',
                    display: 'block',
                    transition: 'all 0.3s ease-in-out',
                  }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/assets/info_kegiatan.png';
                  }}
                />

                {/* Navigation Arrow Controls (for multi-image) */}
                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(
                          (prev) => (prev - 1 + gallery.length) % gallery.length
                        );
                      }}
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(4px)',
                        color: 'var(--primary-deep)',
                        border: '1px solid #cbd5e1',
                        borderRadius: '50%',
                        width: '42px',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        fontSize: '1.1rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                      }}
                      title="Foto Sebelumnya"
                    >
                      <i className="fa-solid fa-chevron-left" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide((prev) => (prev + 1) % gallery.length);
                      }}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(4px)',
                        color: 'var(--primary-deep)',
                        border: '1px solid #cbd5e1',
                        borderRadius: '50%',
                        width: '42px',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        fontSize: '1.1rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                      }}
                      title="Foto Selanjutnya"
                    >
                      <i className="fa-solid fa-chevron-right" />
                    </button>
                  </>
                )}

                {/* Lightbox Badge indicator on image */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    zIndex: 4,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i className="fa-solid fa-magnifying-glass-plus" />
                  {gallery.length > 1
                    ? `${currentSlide + 1} / ${gallery.length} (Klik untuk Perbesar)`
                    : 'Klik untuk Perbesar'}
                </div>

                {/* Looping slide dots */}
                {gallery.length > 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '14px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: '6px',
                      zIndex: 5,
                    }}
                  >
                    {gallery.map((_, idx) => (
                      <span
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentSlide(idx);
                        }}
                        style={{
                          width: currentSlide === idx ? '20px' : '8px',
                          height: '8px',
                          borderRadius: '4px',
                          background:
                            currentSlide === idx
                              ? 'var(--accent)'
                              : 'rgba(255, 255, 255, 0.6)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails strip below main slider */}
              {gallery.length > 1 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginTop: '0.85rem',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem',
                  }}
                >
                  {gallery.map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      style={{
                        position: 'relative',
                        width: '75px',
                        height: '55px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border:
                          currentSlide === idx
                            ? '2px solid var(--accent)'
                            : '2px solid #cbd5e1',
                        opacity: currentSlide === idx ? 1 : 0.6,
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={formatImageUrl(url)}
                        alt={`Thumb ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/assets/info_kegiatan.png';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Article Body Content */}
          <div
            className="info-detail-body"
            dangerouslySetInnerHTML={{ __html: item.description || '' }}
            style={{
              fontSize: '1rem',
              lineHeight: 1.75,
              color: 'var(--text-main)',
              marginBottom: '2.5rem',
            }}
          />

          {/* Footer Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleShare}
                className="btn btn-outline"
                style={{
                  borderRadius: '50px',
                  padding: '0.55rem 1.25rem',
                  fontSize: '0.85rem',
                }}
              >
                <i
                  className="fa-solid fa-share-nodes"
                  style={{ marginRight: '6px' }}
                />{' '}
                Bagikan Tautan
              </button>
            </div>

            {(() => {
              const contactConfig = getContactConfig();
              return contactConfig.isExternal ? (
                <a
                  href={contactConfig.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    borderRadius: '50px',
                    padding: '0.55rem 1.5rem',
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {contactConfig.isWa && (
                    <i
                      className="fa-brands fa-whatsapp"
                      style={{ fontSize: '1rem' }}
                    />
                  )}
                  Hubungi Kami <i className="fa-solid fa-arrow-right-long" />
                </a>
              ) : (
                <Link
                  to={contactConfig.url}
                  className="btn btn-primary"
                  style={{
                    borderRadius: '50px',
                    padding: '0.55rem 1.5rem',
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  Hubungi Kami <i className="fa-solid fa-arrow-right-long" />
                </Link>
              );
            })()}
          </div>
        </article>

        {/* Retention Feature 1: Dukung Produk Warga Rawa Arum (Spotlight UMKM) */}
        {featuredUmkms.length > 0 && (
          <section className="news-umkm-spotlight">
            <div className="news-umkm-header">
              <div>
                <span
                  className="section-tag"
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}
                >
                  Pemberdayaan Ekonomi Pemuda
                </span>
                <h3 className="news-umkm-title">
                  <i
                    className="fa-solid fa-store"
                    style={{ color: 'var(--accent)' }}
                  ></i>
                  Dukung Usaha Warga Rawa Arum
                </h3>
              </div>
              <Link
                to="/umkm"
                className="btn btn-outline news-umkm-btn news-umkm-btn--desktop"
              >
                Katalog UMKM Lengkap{' '}
                <i
                  className="fa-solid fa-arrow-right-long"
                  style={{ marginLeft: '4px' }}
                ></i>
              </Link>
            </div>
            <p
              style={{
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
              }}
            >
              Membeli produk &amp; jasa warga lokal membantu menggerakkan roda
              ekonomi Kelurahan Rawa Arum.
            </p>
            <div className="news-umkm-grid">
              {featuredUmkms.map((u) => (
                <Link
                  key={u._id}
                  to={`/informasi/${u._id}`}
                  className="news-umkm-card"
                >
                  <div className="news-umkm-img-wrapper">
                    <img
                      src={formatImageUrl(
                        u.imageUrl || '/assets/potensi_umkm.png'
                      )}
                      alt={u.title}
                      className="news-umkm-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/potensi_umkm.png';
                      }}
                    />
                  </div>
                  <div className="news-umkm-body">
                    <h4 className="news-umkm-name">{u.title}</h4>
                    <span className="news-umkm-price">
                      {u.priceRange
                        ? u.priceRange
                        : u.badge || 'UMKM Rawa Arum'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile-only bottom button */}
            <div className="news-umkm-bottom-action">
              <Link
                to="/umkm"
                className="btn btn-outline news-umkm-btn news-umkm-btn--mobile"
              >
                Katalog UMKM Lengkap{' '}
                <i
                  className="fa-solid fa-arrow-right-long"
                  style={{ marginLeft: '4px' }}
                ></i>
              </Link>
            </div>
          </section>
        )}

        {/* Retention Feature 3: Jelajahi Portal Karang Taruna Rawa Arum */}
        <section className="news-explore-section">
          <div className="news-explore-header">
            <h3 className="news-explore-title">
              <i
                className="fa-solid fa-compass"
                style={{ color: 'var(--accent)', marginRight: '8px' }}
              ></i>
              Jelajahi Portal Karang Taruna Rawa Arum
            </h3>
            <p className="news-explore-subtitle">
              Portal ini menyediakan berbagai layanan publik &amp; pemberdayaan
              pemuda. Temukan fitur yang Anda butuhkan:
            </p>
          </div>
          <div className="news-explore-grid">
            <Link to="/umkm" className="news-explore-card">
              <div className="news-explore-icon">
                <i className="fa-solid fa-bag-shopping"></i>
              </div>
              <div className="news-explore-info">
                <span className="news-explore-label">Katalog UMKM</span>
                <span className="news-explore-subtext">
                  Produk &amp; jasa warga
                </span>
              </div>
            </Link>

            <Link to="/loker" className="news-explore-card">
              <div className="news-explore-icon">
                <div className="news-explore-icon-inner">
                  <i className="fa-solid fa-briefcase"></i>
                </div>
              </div>
              <div className="news-explore-info">
                <span className="news-explore-label">Info Loker</span>
                <span className="news-explore-subtext">Lowongan industri</span>
              </div>
            </Link>

            <Link to="/keuangan" className="news-explore-card">
              <div className="news-explore-icon">
                <i className="fa-solid fa-vault"></i>
              </div>
              <div className="news-explore-info">
                <span className="news-explore-label">Transparansi Kas</span>
                <span className="news-explore-subtext">
                  Laporan dana terbuka
                </span>
              </div>
            </Link>

            <Link to="/cuaca" className="news-explore-card">
              <div className="news-explore-icon">
                <i className="fa-solid fa-cloud-sun"></i>
              </div>
              <div className="news-explore-info">
                <span className="news-explore-label">Cuaca &amp; Udara</span>
                <span className="news-explore-subtext">Sensor real-time</span>
              </div>
            </Link>

            <Link to="/kemitraan" className="news-explore-card">
              <div className="news-explore-icon">
                <i className="fa-solid fa-handshake"></i>
              </div>
              <div className="news-explore-info">
                <span className="news-explore-label">Kemitraan CSR</span>
                <span className="news-explore-subtext">
                  Kolaborasi industri
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* Related Articles Section */}
        {relatedItems.length > 0 && (
          <div
            className="news-related-container"
            style={{ marginTop: '2.5rem' }}
          >
            <div className="news-related-header">
              <h3 className="news-related-title">
                Informasi &amp; Berita Terkait
              </h3>
              <Link
                to="/kegiatan"
                className="btn btn-outline news-related-btn news-related-btn--desktop"
              >
                Lihat Berita Lainnya{' '}
                <i className="fa-solid fa-arrow-right-long" />
              </Link>
            </div>

            <div className="grid-informasi-4">
              {relatedItems.map((rel) => (
                <InfoCard key={rel._id} item={rel} />
              ))}
            </div>

            {/* Mobile-only bottom button */}
            <div className="news-related-bottom-action">
              <Link
                to="/kegiatan"
                className="btn btn-outline news-related-btn news-related-btn--mobile"
              >
                Lihat Berita Lainnya{' '}
                <i className="fa-solid fa-arrow-right-long" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Popup Modal */}
      <DocPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
};

export default InfoDetailPage;
