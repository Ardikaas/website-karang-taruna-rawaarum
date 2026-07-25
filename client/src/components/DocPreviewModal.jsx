import React, { useState } from 'react';

/**
 * Reusable, high-end interactive Dark-Themed Document Lightbox Preview Modal.
 * Features dark glassmorphism theme, interactive zoom (+/-), rotation (90deg), double-click zoom, and crisp image matting.
 */
const DocPreviewModal = ({ doc, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!doc) return null;

  const docTitle = doc.title || 'Dokumen Scan Sertifikat Resmi';
  const fileUrl = doc.fileUrl || '/assets/potensi_umkm.png';

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3.5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDoubleClick = () => {
    setZoom((prev) => (prev === 1 ? 1.8 : 1));
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '1000px',
          width: '100%',
          maxHeight: '94vh',
          height: '90vh',
          background: '#0b192c',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow:
            '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Lightbox Header Bar (Dark Glassmorphism Theme) */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            background: 'linear-gradient(135deg, #0b192c 0%, #1e293b 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Document Title Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minWidth: '200px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(249, 115, 22, 0.15)',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f97316',
                fontSize: '1.1rem',
                flexShrink: 0,
              }}
            >
              <i className="fa-solid fa-file-contract" />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#f8fafc',
                  letterSpacing: '-0.01em',
                }}
              >
                {docTitle}
              </h3>
              <small
                style={{
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Dokumen Scan Resmi Legalitas UMKM
              </small>
            </div>
          </div>

          {/* Interactive Controls & Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Zoom Controls Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '2px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                style={{
                  background: 'none',
                  border: 'none',
                  color: zoom <= 0.5 ? '#475569' : '#e2e8f0',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  cursor: zoom <= 0.5 ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                }}
                title="Perkecil Dokumen (-)"
              >
                <i className="fa-solid fa-minus" />
              </button>

              <button
                type="button"
                onClick={handleResetZoom}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: 'none',
                  color: '#38bdf8',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  minWidth: '52px',
                  textAlign: 'center',
                }}
                title="Reset Zoom ke 100%"
              >
                {Math.round(zoom * 100)}%
              </button>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 3.5}
                style={{
                  background: 'none',
                  border: 'none',
                  color: zoom >= 3.5 ? '#475569' : '#e2e8f0',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  cursor: zoom >= 3.5 ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                }}
                title="Perbesar Dokumen (+)"
              >
                <i className="fa-solid fa-plus" />
              </button>
            </div>

            {/* Rotate Button */}
            <button
              type="button"
              onClick={handleRotate}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              title="Putar Dokumen (90°)"
            >
              <i className="fa-solid fa-rotate-right" /> Putar
            </button>

            {/* Download Link */}
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="fa-solid fa-arrow-down-to-line" /> Unduh
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.05rem',
                marginLeft: '4px',
                transition: 'all 0.2s ease',
              }}
              title="Tutup Modal (Esc)"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        {/* Lightbox Body Canvas (Sleek Dark Canvas Viewport) */}
        <div
          style={{
            flex: 1,
            padding: '2rem',
            overflow: 'auto',
            display: 'grid',
            placeItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            width: '100%',
            background:
              'radial-gradient(circle at center, #1e293b 0%, #020617 100%)',
            position: 'relative',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              margin: 'auto',
              transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              cursor: zoom > 1 ? 'zoom-out' : 'zoom-in',
              maxWidth: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onDoubleClick={handleDoubleClick}
            title="Klik 2x untuk perbesar / perkecil"
          >
            <div
              style={{
                background: '#ffffff',
                padding: '10px',
                borderRadius: '12px',
                boxShadow:
                  '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: 'auto',
              }}
            >
              <img
                src={fileUrl}
                alt={docTitle}
                style={{
                  maxWidth: '100%',
                  maxHeight: '68vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  display: 'block',
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/potensi_umkm.png';
                }}
              />
            </div>
          </div>
        </div>

        {/* Lightbox Footer Status Bar */}
        <div
          style={{
            padding: '0.65rem 1.5rem',
            background: '#040711',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: '#64748b',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#22c55e',
              fontWeight: 600,
            }}
          >
            <i className="fa-solid fa-circle-check" /> Dokumen Resmi
            Terverifikasi Kelurahan Rawa Arum
          </span>
          <div style={{ display: 'flex', gap: '1.25rem', color: '#94a3b8' }}>
            <span>
              <i className="fa-solid fa-mouse-pointer" /> Klik 2x untuk zoom
            </span>
            <span>
              <i className="fa-solid fa-magnifying-glass-plus" /> Skala:{' '}
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocPreviewModal;
