import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchUmkmById, fetchUmkms, incrementUmkmView } from '../services/api';
import InfoCard from '../components/InfoCard';
import DocPreviewModal from '../components/DocPreviewModal';
import { getUmkmDetailUrl } from '../utils/slugify';

const UmkmDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let intervalId;

    const loadData = async () => {
      setLoading(true);
      setNotFound(false);

      const data = await fetchUmkmById(id);
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setItem(data);
      const allImgs = [];
      if (data.imageUrl) allImgs.push(data.imageUrl);
      if (Array.isArray(data.images)) {
        data.images.forEach((img) => {
          if (img && !allImgs.includes(img)) allImgs.push(img);
        });
      }
      const gallery =
        allImgs.length > 0 ? allImgs : ['/assets/potensi_umkm.png'];
      setActiveImage(gallery[0]);
      setActiveImageIndex(0);

      document.title = `${data.title} - Showcase UMKM Rawa Arum`;

      // Track view (deduplicated by session)
      incrementUmkmView(id).then((res) => {
        if (res && res.viewsCount !== undefined) {
          setItem((prev) =>
            prev ? { ...prev, viewsCount: res.viewsCount } : prev
          );
        }
      });

      // Load related UMKM items
      try {
        const all = await fetchUmkms();
        const filtered = all
          .filter((i) => String(i._id) !== String(data._id))
          .sort((a, b) => {
            const timeA =
              new Date(a.createdAt || a.updatedAt || a.date).getTime() || 0;
            const timeB =
              new Date(b.createdAt || b.updatedAt || b.date).getTime() || 0;
            return timeB - timeA;
          })
          .slice(0, 4);
        setRelatedItems(filtered);
      } catch (_err) {
        setRelatedItems([]);
      }

      setLoading(false);
    };

    if (id) {
      loadData();

      // Polling views count secara real-time (setiap 12 detik)
      intervalId = setInterval(async () => {
        const updated = await fetchUmkmById(id);
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

  // Auto-slide gallery photos every 4 seconds
  useEffect(() => {
    if (!item) return;

    const allImgs = [];
    if (item.imageUrl) allImgs.push(item.imageUrl);
    if (Array.isArray(item.images)) {
      item.images.forEach((img) => {
        if (img && !allImgs.includes(img)) allImgs.push(img);
      });
    }
    const gallery = allImgs.length > 0 ? allImgs : ['/assets/potensi_umkm.png'];

    if (gallery.length <= 1) return;

    const timer = setInterval(() => {
      setActiveImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % gallery.length;
        setActiveImage(gallery[nextIndex]);
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [item]);

  const formatWaNumber = (numStr) => {
    if (!numStr) return '6281234567890';
    let cleaned = numStr.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    return cleaned;
  };

  const getWaLink = (productName = '') => {
    const wa = formatWaNumber(item?.whatsapp);
    const msg = productName
      ? `Halo ${item?.title}, saya ingin memesan / menanyakan layanan *${productName}* dari website Karang Taruna Rawa Arum.`
      : `Halo ${item?.title}, saya tertarik dengan produk/jasa Anda di website Karang Taruna Rawa Arum. Bisa minta info lebih lanjut?`;
    return `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
  };

  if (loading) {
    return (
      <div
        className="subpage-layout"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '65vh',
        }}
      >
        <i
          className="fa-solid fa-store fa-spin"
          style={{
            fontSize: '2.5rem',
            color: 'var(--accent)',
            marginBottom: '1rem',
          }}
        />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
          Memuat profil & katalog UMKM...
        </p>
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
            className="fa-solid fa-store-slash"
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
            UMKM Tidak Ditemukan
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
              maxWidth: '500px',
              margin: '0 auto 2rem',
            }}
          >
            Maaf, profil UMKM yang Anda cari tidak ditemukan atau telah
            diperbarui oleh pengurus.
          </p>
          <button
            onClick={() => navigate('/umkm')}
            className="btn btn-primary"
            style={{ borderRadius: '50px', padding: '0.75rem 1.75rem' }}
          >
            <i
              className="fa-solid fa-arrow-left"
              style={{ marginRight: '8px' }}
            />{' '}
            Kembali ke Katalog UMKM
          </button>
        </div>
      </div>
    );
  }

  // Combine cover photo (imageUrl) FIRST, followed by additional gallery images
  const allImages = [];
  if (item.imageUrl) {
    allImages.push(item.imageUrl);
  }
  if (Array.isArray(item.images)) {
    item.images.forEach((img) => {
      if (img && !allImages.includes(img)) {
        allImages.push(img);
      }
    });
  }
  const galleryImages =
    allImages.length > 0 ? allImages : ['/assets/potensi_umkm.png'];
  const isJasa =
    item.categoryType === 'jasa' || item.badge?.toLowerCase() === 'jasa';

  const handlePrevImage = () => {
    const prevIdx =
      (activeImageIndex - 1 + galleryImages.length) % galleryImages.length;
    setActiveImageIndex(prevIdx);
    setActiveImage(galleryImages[prevIdx]);
  };

  const handleNextImage = () => {
    const nextIdx = (activeImageIndex + 1) % galleryImages.length;
    setActiveImageIndex(nextIdx);
    setActiveImage(galleryImages[nextIdx]);
  };

  const handleSelectThumbnail = (url, idx) => {
    setActiveImage(url);
    setActiveImageIndex(idx);
  };

  // Dynamically compute price range from itemsList menu prices
  const getComputedPriceRange = () => {
    if (Array.isArray(item?.itemsList) && item.itemsList.length > 0) {
      const prices = item.itemsList
        .map((it) => {
          if (typeof it.price === 'number') return it.price;
          if (typeof it.price === 'string') {
            const num = parseInt(it.price.replace(/\D/g, ''), 10);
            return isNaN(num) ? null : num;
          }
          return null;
        })
        .filter((val) => val !== null && val > 0);

      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const formatRupiah = (val) => `Rp ${val.toLocaleString('id-ID')}`;

        if (minPrice === maxPrice) {
          return formatRupiah(minPrice);
        }
        return `${formatRupiah(minPrice)} - ${formatRupiah(maxPrice)}`;
      }
    }

    if (item?.priceRange && String(item.priceRange).trim() !== '') {
      return item.priceRange;
    }

    return '';
  };

  const formatPriceBadge = (priceStr) => {
    if (!priceStr) return 'Sesuai Pilihan';
    const cleanDigits = String(priceStr).replace(/\D/g, '');
    if (!cleanDigits) return priceStr;
    const formattedNum = parseInt(cleanDigits, 10).toLocaleString('id-ID');
    return `Rp ${formattedNum}`;
  };

  const computedPriceDisplay = getComputedPriceRange();

  return (
    <div className="subpage-layout">
      <div className="container" style={{ maxWidth: '1000px' }}>
        {/* Breadcrumb Header */}
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
            <Link to="/umkm" style={{ color: 'var(--text-muted)' }}>
              Showcase UMKM
            </Link>
            <i
              className="fa-solid fa-chevron-right"
              style={{ fontSize: '0.7rem' }}
            />
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
              {item.title}
            </span>
          </div>

          <button
            onClick={() => navigate('/umkm')}
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
            <i className="fa-solid fa-arrow-left" /> Kembali ke Katalog
          </button>
        </div>

        {/* Top UMKM Title & Badges */}
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                background: isJasa
                  ? 'linear-gradient(135deg, #0ea5e9, #0284c7)'
                  : 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#fff',
                fontWeight: 900,
                fontSize: '0.75rem',
                padding: '0.3rem 0.85rem',
                borderRadius: '50px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i
                className={
                  isJasa ? 'fa-solid fa-wrench' : 'fa-solid fa-bag-shopping'
                }
              />
              {isJasa ? 'UMKM Jasa & Layanan' : 'UMKM Produk & Kuliner'}
            </span>
            <span
              style={{
                background: 'rgba(11, 37, 69, 0.06)',
                color: 'var(--primary-deep)',
                fontWeight: 700,
                fontSize: '0.75rem',
                padding: '0.3rem 0.85rem',
                borderRadius: '50px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Jumlah Pengunjung Real-time"
            >
              <i
                className="fa-solid fa-eye"
                style={{ color: 'var(--accent)' }}
              />
              {(item.viewsCount || 0).toLocaleString('id-ID')} Dilihat
            </span>
          </div>

          <h1
            style={{
              fontSize: '2.1rem',
              fontWeight: 900,
              color: 'var(--primary-deep)',
              lineHeight: 1.25,
            }}
          >
            {item.title}
          </h1>
        </div>

        {/* Main 2-Column Grid Section: Gallery (Left) & Quick Info + WA CTA (Right) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '2rem',
            marginBottom: '3rem',
          }}
          className="umkm-detail-grid"
        >
          {/* Left Column: Multi-Photo Gallery */}
          <div>
            {/* Main Featured Photo Slider */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '380px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '1rem',
                backgroundColor: '#ffffff',
                border: '1px solid rgba(11, 37, 69, 0.08)',
              }}
            >
              {/* Horizontal Sliding Track */}
              <div
                style={{
                  display: 'flex',
                  width: `${galleryImages.length * 100}%`,
                  height: '100%',
                  transform: `translateX(-${activeImageIndex * (100 / galleryImages.length)}%)`,
                  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {galleryImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      setPreviewDoc({ title: item.title, fileUrl: imgUrl })
                    }
                    title="Klik untuk memperbesar gambar"
                    style={{
                      width: `${100 / galleryImages.length}%`,
                      height: '100%',
                      flexShrink: 0,
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.75rem',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`${item.title} ${idx + 1}`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/potensi_umkm.png';
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Magnify Hint Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(4px)',
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  zIndex: 4,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
              >
                <i className="fa-solid fa-magnifying-glass-plus" />
                <span>Klik untuk memperbesar</span>
              </div>

              {/* Prev / Next Controls if multiple photos exist */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '10px',
                      transform: 'translateY(-50%)',
                      background: 'rgba(15, 23, 42, 0.65)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '38px',
                      height: '38px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease',
                      zIndex: 3,
                    }}
                    title="Foto Sebelumnya"
                  >
                    <i className="fa-solid fa-chevron-left" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextImage}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: '10px',
                      transform: 'translateY(-50%)',
                      background: 'rgba(15, 23, 42, 0.65)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '38px',
                      height: '38px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease',
                      zIndex: 3,
                    }}
                    title="Foto Selanjutnya"
                  >
                    <i className="fa-solid fa-chevron-right" />
                  </button>

                  {/* Photo Counter Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      color: '#fff',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backdropFilter: 'blur(4px)',
                      zIndex: 3,
                    }}
                  >
                    {activeImageIndex + 1} / {galleryImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Gallery Strip */}
            {galleryImages.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  overflowX: 'auto',
                  maxWidth: '448px',
                  width: '100%',
                  paddingBottom: '0.5rem',
                  scrollbarWidth: 'thin',
                }}
              >
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectThumbnail(imgUrl, idx)}
                    style={{
                      width: '80px',
                      height: '65px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border:
                        activeImage === imgUrl
                          ? '2.5px solid var(--accent)'
                          : '1px solid #cbd5e1',
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0,
                      background: '#ffffff',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`Galeri ${idx + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/potensi_umkm.png';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Quick Contact & Business Info Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid rgba(11, 37, 69, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  color: 'var(--primary-deep)',
                  marginBottom: '1.25rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                Informasi & Pemesanan Usaha
              </h3>

              {/* Address */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: '0.3rem',
                  }}
                >
                  <i
                    className="fa-solid fa-location-dot"
                    style={{ color: 'var(--accent)', marginRight: '6px' }}
                  />{' '}
                  Alamat Usaha
                </div>
                <p
                  style={{
                    fontSize: '0.92rem',
                    color: 'var(--text-main)',
                    lineHeight: 1.5,
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  {item.address ||
                    'Jl. Kelurahan Rawa Arum, Kota Cilegon, Banten'}
                </p>
                {item.address && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(item.address + ' Rawa Arum Cilegon')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--accent)',
                      fontWeight: 700,
                      display: 'inline-block',
                      marginTop: '0.3rem',
                    }}
                  >
                    Buka di Google Maps{' '}
                    <i
                      className="fa-solid fa-arrow-up-right-from-square"
                      style={{ fontSize: '0.75rem' }}
                    />
                  </a>
                )}
              </div>

              {/* Price Range */}
              {computedPriceDisplay ? (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      marginBottom: '0.3rem',
                    }}
                  >
                    <i
                      className="fa-solid fa-tag"
                      style={{ color: '#16a34a', marginRight: '6px' }}
                    />{' '}
                    Kisaran Harga / Tarif
                  </div>
                  <p
                    style={{
                      fontSize: '1.1rem',
                      color: '#16a34a',
                      fontWeight: 900,
                      margin: 0,
                    }}
                  >
                    {computedPriceDisplay}
                  </p>
                </div>
              ) : null}

              {/* Status */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: '0.3rem',
                  }}
                >
                  Status Layanan
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#dcfce7',
                    color: '#15803d',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '50px',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#22c55e',
                    }}
                  />
                  Buka &amp; Siap Melayani Pesanan
                </span>
              </div>
            </div>

            {/* Direct WhatsApp CTA Button */}
            <div>
              <a
                href={getWaLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #25d366, #128c7e)',
                  color: '#fff',
                  padding: '0.9rem 1.25rem',
                  borderRadius: '50px',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                  border: 'none',
                }}
              >
                <i
                  className="fa-brands fa-whatsapp"
                  style={{ fontSize: '1.35rem' }}
                />
                Hubungi via WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Section: Catalog Menu / Service Tariff List */}
        {item.itemsList && item.itemsList.length > 0 && (
          <section
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid rgba(11, 37, 69, 0.06)',
              marginBottom: '3rem',
            }}
          >
            <div
              style={{
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 900,
                    color: 'var(--primary-deep)',
                    margin: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <i
                    className={
                      isJasa ? 'fa-solid fa-list-check' : 'fa-solid fa-utensils'
                    }
                    style={{ color: 'var(--accent)' }}
                  />
                  {isJasa
                    ? 'Daftar Layanan & Tarif Jasa'
                    : 'Katalog Menu & Produk Utama'}
                </h2>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.25rem',
                    margin: 0,
                  }}
                >
                  Klik tombol pesan pada menu pilihan Anda untuk memesan
                  langsung via WhatsApp.
                </p>
              </div>
            </div>

            {/* Grid of Menu Items */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {item.itemsList.map((sub, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <h4
                        style={{
                          fontSize: '1rem',
                          fontWeight: 800,
                          color: 'var(--primary-deep)',
                          margin: 0,
                        }}
                      >
                        {sub.name}
                      </h4>
                      <span
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 900,
                          color: '#16a34a',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatPriceBadge(sub.price)}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.45,
                        marginBottom: '1rem',
                      }}
                    >
                      {sub.description}
                    </p>
                  </div>

                  <a
                    href={getWaLink(sub.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{
                      borderRadius: '50px',
                      padding: '0.4rem 0.9rem',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#16a34a',
                      borderColor: '#bbf7d0',
                      background: '#f0fdf4',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                    }}
                  >
                    <i className="fa-brands fa-whatsapp" /> Pesan{' '}
                    {isJasa ? 'Jasa Ini' : 'Menu Ini'}
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Full Description & Story */}
        <section
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid rgba(11, 37, 69, 0.06)',
            marginBottom: '2.5rem',
          }}
        >
          <h3
            style={{
              fontSize: '1.3rem',
              fontWeight: 900,
              color: 'var(--primary-deep)',
              marginBottom: '1rem',
            }}
          >
            Tentang Usaha &amp; Layanan
          </h3>
          <div
            dangerouslySetInnerHTML={{ __html: item.description || '' }}
            style={{
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'var(--text-main)',
            }}
          />
        </section>

        {/* Section: Scan Dokumen Legalitas Usaha (Bukti Resmi) */}
        {item.certificationDocs && item.certificationDocs.length > 0 && (
          <section
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid rgba(11, 37, 69, 0.06)',
              marginBottom: '3.5rem',
            }}
          >
            <h3
              style={{
                fontSize: '1.3rem',
                fontWeight: 900,
                color: 'var(--primary-deep)',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <i
                className="fa-solid fa-file-contract"
                style={{ color: 'var(--accent)' }}
              />
              Bukti Scan Dokumen Legalitas &amp; Sertifikat Resmi
            </h3>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
              }}
            >
              Berikut adalah salinan dokumen scan resmi keabsahan sertifikasi
              dan izin usaha ini.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {item.certificationDocs.map((doc, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      onClick={() => setPreviewDoc(doc)}
                      style={{
                        display: 'block',
                        overflow: 'hidden',
                        borderRadius: '6px',
                        marginBottom: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      <img
                        src={doc.fileUrl}
                        alt={doc.title}
                        style={{
                          width: '100%',
                          height: '140px',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.transform = 'scale(1.05)')
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.transform = 'scale(1)')
                        }
                      />
                    </div>
                    <h4
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        color: 'var(--primary-deep)',
                        margin: '0 0 0.5rem 0',
                      }}
                    >
                      {doc.title}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="btn btn-outline"
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.75rem',
                      borderRadius: '50px',
                      textAlign: 'center',
                      fontWeight: 700,
                      width: '100%',
                      cursor: 'pointer',
                    }}
                  >
                    <i className="fa-solid fa-expand" /> Buka Dokumen Penuh
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related UMKM Section */}
        {relatedItems.length > 0 && (
          <div>
            <h3
              style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                color: 'var(--primary-deep)',
                marginBottom: '1.5rem',
              }}
            >
              Jelajahi UMKM Rawa Arum Lainnya
            </h3>
            <div className="grid-informasi-4">
              {relatedItems.map((rel) => (
                <InfoCard
                  key={rel._id}
                  item={rel}
                  linkTo={getUmkmDetailUrl(rel)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Document Lightbox Popup Modal */}
      <DocPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />

      {/* Grid Responsiveness Inline CSS */}
      <style>{`
        @media (max-width: 768px) {
          .umkm-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default UmkmDetailPage;
