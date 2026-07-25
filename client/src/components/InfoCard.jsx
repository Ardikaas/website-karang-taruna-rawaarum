import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable InfoCard component for rendering content items across Home,
 * LokerPage, KegiatanPage, PengumumanPage, and UmkmPage.
 *
 * Directs visitors to the dedicated Detail Page (/informasi/:id) when clicked.
 */
const InfoCard = ({ item, linkTo, customBtnText }) => {
  if (!item) return null;

  const isWarningBadge =
    item.type === 'pengumuman' ||
    (item.badge && item.badge.toLowerCase() === 'penting');
  const badgeClass = isWarningBadge ? 'warning' : '';

  // Priority link: custom linkTo -> /informasi/:id -> /:type
  const targetId = item._id || item.id;
  const detailLink =
    linkTo ||
    (targetId ? `/informasi/${targetId}` : `/${item.type || 'kegiatan'}`);
  const btnLabel = customBtnText || item.linkText || 'Lihat Detail';

  return (
    <article className="info-card">
      <Link
        to={detailLink}
        className="info-image-wrapper"
        style={{ display: 'block' }}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title || 'Informasi'}
            className="info-image"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/assets/potensi_umkm.png';
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f1f5f9',
              color: '#94a3b8',
              fontSize: '2rem',
            }}
          >
            <i className="fa-solid fa-newspaper" />
          </div>
        )}
        {item.badge && (
          <div className={`info-tag-badge ${badgeClass}`}>{item.badge}</div>
        )}
      </Link>

      <div className="info-content">
        {item.date && (
          <div className="info-meta">
            <span>
              <i
                className="fa-regular fa-calendar"
                style={{ marginRight: '6px' }}
              />
              {item.date}
            </span>
          </div>
        )}

        <Link
          to={detailLink}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <h3 className="info-title">{item.title}</h3>
        </Link>

        <p
          className="info-desc"
          dangerouslySetInnerHTML={{ __html: item.description || '' }}
        />

        <Link to={detailLink} className="info-btn">
          {btnLabel} <i className="fa-solid fa-arrow-right-long" />
        </Link>
      </div>
    </article>
  );
};

export default InfoCard;
