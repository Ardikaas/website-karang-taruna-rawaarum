import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  fetchInfoItemById,
  fetchInfoItems,
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
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const loadDetail = async () => {
      setLoading(true);
      setNotFound(false);

      const data = await fetchInfoItemById(id);
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setItem(data);
      document.title = `${data.title} - Karang Taruna Kelurahan Rawa Arum`;

      // Fetch related items of same category or recent
      try {
        const all = await fetchInfoItems(
          data.type !== 'all' ? data.type : null
        );
        const filtered = all
          .filter((i) => String(i._id) !== String(data._id))
          .slice(0, 2);
        setRelatedItems(filtered);
      } catch (_err) {
        setRelatedItems([]);
      }

      setLoading(false);
    };

    if (id) {
      loadDetail();
    }
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

  if (loading) {
    return (
      <div
        className="subpage-layout"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <i
          className="fa-solid fa-circle-notch fa-spin"
          style={{
            fontSize: '2.5rem',
            color: 'var(--accent)',
            marginBottom: '1rem',
          }}
        />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
          Memuat detail informasi...
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

          {/* Featured Image */}
          {item.imageUrl && (
            <div
              onClick={() =>
                setPreviewDoc({
                  title: item.title,
                  fileUrl: formatImageUrl(item.imageUrl),
                })
              }
              title="Klik untuk memperbesar gambar"
              style={{
                position: 'relative',
                width: '100%',
                borderRadius: 'calc(var(--radius-md) - 4px)',
                overflow: 'hidden',
                marginBottom: '2rem',
                backgroundColor: '#ffffff',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
              }}
            >
              <img
                src={formatImageUrl(item.imageUrl)}
                alt={item.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
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

            <Link
              to="/kontak"
              className="btn btn-primary"
              style={{
                borderRadius: '50px',
                padding: '0.55rem 1.5rem',
                fontSize: '0.85rem',
              }}
            >
              Hubungi Kami{' '}
              <i
                className="fa-solid fa-arrow-right-long"
                style={{ marginLeft: '6px' }}
              />
            </Link>
          </div>
        </article>

        {/* Related Articles Section */}
        {relatedItems.length > 0 && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  color: 'var(--primary-deep)',
                }}
              >
                Informasi & Berita Terkait
              </h3>
            </div>
            <div className="grid-informasi">
              {relatedItems.map((rel) => (
                <InfoCard key={rel._id} item={rel} />
              ))}
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
