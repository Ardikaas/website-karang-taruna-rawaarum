import { useState, useEffect, useRef } from 'react';
import {
  fetchUmkms,
  createUmkm,
  updateUmkm,
  deleteUmkm,
  toggleVerifyUmkm,
  uploadImage,
} from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import DocPreviewModal from '../../components/DocPreviewModal';
import { compressImageIfNeeded } from '../../utils/imageCompressor';

const SUB_CATEGORIES_PRODUK = [
  'Kuliner & Makanan Basah',
  'Minuman & Kedai Kopi',
  'Kerajinan Tangan & Souvenir',
  'Pakaian & Fashion',
  'Kelontong & Sembako',
  'Hasil Tani & Perikanan',
  'Produk Olahan Kemasan',
  'Produk Lainnya',
];

const SUB_CATEGORIES_JASA = [
  'Bengkel & Otomotif',
  'Jasa Kebersihan & Laundry',
  'Servis Elektronik & Rumah Tangga',
  'Digital, Print & Percetakan',
  'Kecantikan & Barbershop',
  'Jasa Konstruksi & Pertukangan',
  'Sewa & Transportasi',
  'Jasa Layanan Lainnya',
];

const INITIAL_FORM = {
  title: '',
  ownerName: '',
  categoryType: 'produk',
  subCategory: 'Kuliner & Makanan Basah',
  description: '',
  isVerified: true,
  status: 'aktif',
  badge: 'UMKM Binaan',
  whatsapp: '',
  address: '',
  googleMapsUrl: '',
  operatingHours: '08:00 - 20:00 WIB',
  socialInstagram: '',
  priceRange: '',
  certifications: ['Halal MUI', 'NIB (Nomor Induk Berusaha)'],
  certificationDocs: [],
  imageUrl: '/assets/potensi_umkm.png',
  images: [],
  itemsList: [],
};

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const executeCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div
      style={{
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '0.25rem',
          padding: '0.5rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
        }}
      >
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="admin-btn admin-btn--outline admin-btn--sm"
          style={{ padding: '0.3rem 0.5rem', background: '#fff' }}
          title="Tebal (Bold)"
        >
          <i className="fa-solid fa-bold" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="admin-btn admin-btn--outline admin-btn--sm"
          style={{ padding: '0.3rem 0.5rem', background: '#fff' }}
          title="Miring (Italic)"
        >
          <i className="fa-solid fa-italic" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className="admin-btn admin-btn--outline admin-btn--sm"
          style={{ padding: '0.3rem 0.5rem', background: '#fff' }}
          title="Daftar Poin"
        >
          <i className="fa-solid fa-list-ul" />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => onChange(e.target.innerHTML)}
        style={{
          minHeight: '140px',
          padding: '0.75rem',
          outline: 'none',
          fontSize: '0.9rem',
          lineHeight: '1.5',
        }}
        placeholder={placeholder}
      />
    </div>
  );
};

const AdminUmkmPage = () => {
  const { user } = useAuth();
  const isPengurus = user?.role === 'pengurus';

  const { showError, showSuccess } = useToast();
  const [umkms, setUmkms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Main Layout View State: 'list' | 'editor'
  const [currentView, setCurrentView] = useState('list');
  const [editorMode, setEditorMode] = useState('create'); // 'create' | 'edit'
  const [activeId, setActiveId] = useState(null);

  // Form State
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);

  // Upload States
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);

  // Catalog Menu Temp Input State
  const [catalogName, setCatalogName] = useState('');
  const [catalogPrice, setCatalogPrice] = useState('');
  const [catalogDesc, setCatalogDesc] = useState('');

  // Delete Confirm Modal & Document Lightbox State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const loadUmkms = async () => {
    try {
      setLoading(true);
      const data = await fetchUmkms();
      setUmkms(data);
    } catch (err) {
      setError('Gagal memuat data UMKM.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUmkms();
  }, []);

  const handleOpenCreate = () => {
    setForm({
      ...INITIAL_FORM,
      certifications: ['Halal MUI', 'NIB (Nomor Induk Berusaha)'],
      images: [],
      itemsList: [],
    });
    setEditorMode('create');
    setActiveId(null);
    setCurrentView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEdit = (item) => {
    setForm({
      title: item.title || '',
      ownerName: item.ownerName || '',
      categoryType: item.categoryType || 'produk',
      subCategory: item.subCategory || 'Kuliner & Warung',
      description: item.description || '',
      isVerified: item.isVerified !== undefined ? item.isVerified : true,
      status: item.status || 'aktif',
      badge: item.badge || 'UMKM Binaan',
      whatsapp: item.whatsapp || '',
      address: item.address || '',
      googleMapsUrl: item.googleMapsUrl || '',
      operatingHours: item.operatingHours || '08:00 - 20:00 WIB',
      socialInstagram: item.socialInstagram || '',
      priceRange: item.priceRange || '',
      certifications: Array.isArray(item.certifications)
        ? [...item.certifications]
        : [],
      certificationDocs: Array.isArray(item.certificationDocs)
        ? [...item.certificationDocs]
        : [],
      imageUrl: item.imageUrl || '/assets/potensi_umkm.png',
      images: Array.isArray(item.images) ? [...item.images] : [],
      itemsList: Array.isArray(item.itemsList) ? [...item.itemsList] : [],
    });
    setActiveId(item._id);
    setEditorMode('edit');
    setCurrentView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Upload Handlers (With Client-Side Auto Compression <= 1.5MB)
  const handleUploadMainImage = async (e) => {
    const rawFile = e.target.files[0];
    if (!rawFile) return;

    setUploadingMainImage(true);
    try {
      const file = await compressImageIfNeeded(rawFile, 1.5);
      const res = await uploadImage(file);
      const uploadedUrl =
        typeof res === 'string' ? res : res?.imageUrl || res?.url || '';
      if (uploadedUrl) {
        setForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      }
    } catch (err) {
      showError(err.message || 'Gagal mengunggah foto utama.');
    } finally {
      setUploadingMainImage(false);
      e.target.value = '';
    }
  };

  const handleUploadGalleryImage = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setUploadingGalleryImage(true);
    try {
      const uploadPromises = selectedFiles.map(async (rawFile) => {
        const file = await compressImageIfNeeded(rawFile, 1.5);
        const res = await uploadImage(file);
        return typeof res === 'string' ? res : res?.imageUrl || res?.url || '';
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(Boolean);

      if (validUrls.length > 0) {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, ...validUrls],
        }));
      }
    } catch (err) {
      showError(err.message || 'Gagal mengunggah beberapa foto galeri.');
    } finally {
      setUploadingGalleryImage(false);
      e.target.value = '';
    }
  };

  // Document Scan Upload Handlers
  const [uploadingDocScan, setUploadingDocScan] = useState(false);
  const [docTitleInput, setDocTitleInput] = useState('');

  const handleUploadDocScanFile = async (e) => {
    const rawFile = e.target.files[0];
    if (!rawFile) return;

    setUploadingDocScan(true);
    try {
      const file = await compressImageIfNeeded(rawFile, 1.5);
      const res = await uploadImage(file);
      const uploadedUrl =
        typeof res === 'string' ? res : res?.imageUrl || res?.url || '';
      if (!uploadedUrl) {
        showError('Gagal mendapatkan URL file unggahan.');
        return;
      }
      const newDoc = {
        title: docTitleInput.trim() || 'Scan Dokumen Sertifikat',
        fileUrl: uploadedUrl,
      };
      setForm((prev) => ({
        ...prev,
        certificationDocs: [...(prev.certificationDocs || []), newDoc],
      }));
      setDocTitleInput('');
    } catch (err) {
      showError(err.message || 'Gagal mengunggah dokumen scan.');
    } finally {
      setUploadingDocScan(false);
      e.target.value = '';
    }
  };

  const handleRemoveDocScan = (index) => {
    setForm((prev) => ({
      ...prev,
      certificationDocs: (prev.certificationDocs || []).filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleRemoveGalleryImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const formatPriceBadge = (priceStr) => {
    if (!priceStr) return 'Sesuai Pilihan';
    const cleanDigits = String(priceStr).replace(/\D/g, '');
    if (!cleanDigits) return priceStr;
    const formattedNum = parseInt(cleanDigits, 10).toLocaleString('id-ID');
    return `Rp ${formattedNum}`;
  };

  // Price Input Formatting with Thousand Separator Dots
  const handlePriceInputChange = (e) => {
    const rawVal = e.target.value;
    const cleanDigits = rawVal.replace(/\D/g, '');
    if (!cleanDigits) {
      setCatalogPrice('');
      return;
    }
    const formattedNum = parseInt(cleanDigits, 10).toLocaleString('id-ID');
    setCatalogPrice(`Rp ${formattedNum}`);
  };

  // Catalog Items Management
  const handleAddCatalogItem = () => {
    if (!catalogName.trim()) return;

    let finalPrice = catalogPrice.trim();
    if (finalPrice) {
      const cleanDigits = finalPrice.replace(/\D/g, '');
      if (cleanDigits) {
        finalPrice = `Rp ${parseInt(cleanDigits, 10).toLocaleString('id-ID')}`;
      }
    } else {
      finalPrice = 'Sesuai Pilihan';
    }

    const newItem = {
      name: catalogName.trim(),
      price: finalPrice,
      description: catalogDesc.trim() || '',
      isAvailable: true,
    };
    setForm((prev) => ({
      ...prev,
      itemsList: [...prev.itemsList, newItem],
    }));
    setCatalogName('');
    setCatalogPrice('');
    setCatalogDesc('');
  };

  const handleRemoveCatalogItem = (index) => {
    setForm((prev) => ({
      ...prev,
      itemsList: prev.itemsList.filter((_, i) => i !== index),
    }));
  };

  // Save Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      showError('Nama Usaha dan Deskripsi Lengkap wajib diisi.');
      return;
    }

    const sanitizedDocs = (form.certificationDocs || [])
      .filter(
        (doc) =>
          doc && typeof doc.fileUrl === 'string' && doc.fileUrl.trim() !== ''
      )
      .map((doc) => ({
        title: doc.title ? doc.title.trim() : 'Scan Dokumen Sertifikat',
        fileUrl: doc.fileUrl.trim(),
      }));

    const payload = { ...form, certificationDocs: sanitizedDocs };

    setSubmitting(true);
    try {
      if (editorMode === 'create') {
        await createUmkm(payload);
        showSuccess('Usaha baru berhasil ditambahkan!');
      } else {
        await updateUmkm(activeId, payload);
        showSuccess('Data usaha berhasil diperbarui!');
      }
      setCurrentView('list');
      loadUmkms();
    } catch (err) {
      showError(err.message || 'Gagal menyimpan data UMKM.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUmkm = async (id) => {
    try {
      await deleteUmkm(id);
      setDeleteConfirmId(null);
      showSuccess('Data UMKM berhasil dihapus.');
      loadUmkms();
    } catch (err) {
      showError(err.message || 'Gagal menghapus data UMKM.');
    }
  };

  const handleToggleVerify = async (id) => {
    try {
      const res = await toggleVerifyUmkm(id);
      showSuccess(res.message || 'Status verifikasi berhasil diubah.');
      loadUmkms();
    } catch (err) {
      showError('Gagal mengubah verifikasi UMKM.');
    }
  };

  // Filtering Logic for List View
  const filteredUmkms = (umkms || []).filter((item) => {
    if (!item) return false;

    // If pengurus, restrict access ONLY to UMKMs created by themselves
    if (isPengurus) {
      const createdById =
        typeof item.createdBy === 'object'
          ? item.createdBy?._id
          : item.createdBy;
      const ownerUserId =
        typeof item.ownerUser === 'object'
          ? item.ownerUser?._id
          : item.ownerUser;

      // If no createdBy and no ownerUser (old data), hide from pengurus
      if (!createdById && !ownerUserId) return false;

      const userId = user?._id || user?.id;
      const userMatches =
        (createdById &&
          userId &&
          createdById.toString() === userId.toString()) ||
        (ownerUserId &&
          userId &&
          ownerUserId.toString() === userId.toString()) ||
        (item.createdBy?.email &&
          user?.email &&
          item.createdBy.email === user.email) ||
        (item.createdBy?.username &&
          user?.username &&
          item.createdBy.username === user.username);

      if (!userMatches) return false;
    }

    if (filterCategory === 'produk' && item.categoryType !== 'produk')
      return false;
    if (filterCategory === 'jasa' && item.categoryType !== 'jasa') return false;
    if (filterCategory === 'verified' && !item.isVerified) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        (item.title || '').toLowerCase().includes(q) ||
        (item.ownerName && item.ownerName.toLowerCase().includes(q)) ||
        (item.address && item.address.toLowerCase().includes(q)) ||
        (item.subCategory && item.subCategory.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalProduk = umkms.filter((u) => u.categoryType === 'produk').length;
  const totalJasa = umkms.filter((u) => u.categoryType === 'jasa').length;
  const totalVerified = umkms.filter((u) => u.isVerified).length;
  const totalWaClicks = umkms.reduce(
    (sum, u) => sum + (u.whatsappClicksCount || 0),
    0
  );

  if (loading && umkms.length === 0) {
    return (
      <div className="admin-loading-container">
        <i className="fa-solid fa-spinner fa-spin admin-spinner" />
        <p>Memuat Katalog UMKM...</p>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FULL-PAGE WORKSPACE EDITOR (NO POPUPS / NO COMMAS!)
  // =========================================================================
  if (currentView === 'editor') {
    return (
      <div className="admin-page-container" style={{ paddingBottom: '6rem' }}>
        {/* Top Breadcrumbs & Workspace Bar */}
        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            background: '#fff',
            padding: '1.25rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            border: '1px solid #e2e8f0',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <button
              type="button"
              onClick={() => setCurrentView('list')}
              style={{
                border: 'none',
                background: 'none',
                color: 'var(--accent)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                padding: 0,
                marginBottom: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="fa-solid fa-arrow-left" /> Kembali ke Daftar Katalog
              UMKM
            </button>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 900,
                color: 'var(--primary-deep)',
                margin: 0,
              }}
            >
              {editorMode === 'create'
                ? 'Tambah Data UMKM Binaan Baru'
                : `Edit Usaha: ${form.title}`}
            </h1>
          </div>
        </div>

        <form
          onSubmit={handleSubmitForm}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          {/* SECTION 1: PROFIL & IDENTITAS USAHA */}
          <div className="admin-card" style={{ padding: '1.5rem' }}>
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: 'var(--primary-deep)',
                marginBottom: '1.25rem',
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <i
                className="fa-solid fa-store"
                style={{ color: 'var(--accent)' }}
              />
              1. Identitas Usaha &amp; Pemilik
            </h3>

            <div className="admin-grid-2">
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Nama Usaha / Toko / Bengkel *
                </label>
                <input
                  type="text"
                  className="admin-form-control"
                  required
                  placeholder="Contoh: Dapur Berkah Rawa Arum / Barokah Tech Service AC"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Nama Pemilik Usaha</label>
                <input
                  type="text"
                  className="admin-form-control"
                  placeholder="Contoh: Ibu Siti Hajar / Kang Aji"
                  value={form.ownerName}
                  onChange={(e) =>
                    setForm({ ...form, ownerName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="admin-grid-2">
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Jenis Kategori Usaha *
                </label>
                <select
                  className="admin-form-control"
                  value={form.categoryType}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    const defaultSub =
                      newCat === 'jasa'
                        ? SUB_CATEGORIES_JASA[0]
                        : SUB_CATEGORIES_PRODUK[0];
                    setForm({
                      ...form,
                      categoryType: newCat,
                      subCategory: defaultSub,
                      badge: newCat === 'jasa' ? 'UMKM Jasa' : 'UMKM Produk',
                    });
                  }}
                >
                  <option value="produk">
                    Produk &amp; Kuliner (Makanan / Kerajinan / Barang)
                  </option>
                  <option value="jasa">
                    Jasa &amp; Layanan (Bengkel / Service / Digital / Salon)
                  </option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  Sub-Kategori Spesifik *
                </label>
                <select
                  className="admin-form-control"
                  value={form.subCategory}
                  onChange={(e) =>
                    setForm({ ...form, subCategory: e.target.value })
                  }
                >
                  {(form.categoryType === 'jasa'
                    ? SUB_CATEGORIES_JASA
                    : SUB_CATEGORIES_PRODUK
                  ).map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                  {form.subCategory &&
                    !(
                      form.categoryType === 'jasa'
                        ? SUB_CATEGORIES_JASA
                        : SUB_CATEGORIES_PRODUK
                    ).includes(form.subCategory) && (
                      <option value={form.subCategory}>
                        {form.subCategory}
                      </option>
                    )}
                </select>
              </div>
            </div>

            <div className="admin-grid-2">
              <div className="admin-form-group">
                <label className="admin-form-label">Status Usaha</label>
                <select
                  className="admin-form-control"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="aktif">
                    Aktif &amp; Buka Melayani Pesanan
                  </option>
                  <option value="tutup_sementara">Tutup Sementara</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  Status Verifikasi Binaan Karang Taruna
                </label>
                <select
                  className="admin-form-control"
                  value={form.isVerified ? 'true' : 'false'}
                  onChange={(e) =>
                    setForm({ ...form, isVerified: e.target.value === 'true' })
                  }
                >
                  <option value="true">
                    Terverifikasi Binaan Karang Taruna Rawa Arum
                  </option>
                  <option value="false">Belum Terverifikasi</option>
                </select>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                Deskripsi Lengkap Profil Usaha *
              </label>
              <RichTextEditor
                value={form.description}
                onChange={(val) => setForm({ ...form, description: val })}
                placeholder="Tuliskan cerita latar belakang usaha, keunggulan produk/layanan, dan informasi umum..."
              />
            </div>
          </div>

          {/* SECTION 2: KONTAK & ALAMAT LOKASI */}
          <div className="admin-card" style={{ padding: '1.5rem' }}>
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: 'var(--primary-deep)',
                marginBottom: '1.25rem',
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <i
                className="fa-solid fa-location-dot"
                style={{ color: 'var(--accent)' }}
              />
              2. Informasi Kontak WhatsApp &amp; Lokasi Alamat
            </h3>

            <div className="admin-grid-2">
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Nomor WhatsApp Usaha (Direct Link Chat)
                </label>
                <input
                  type="text"
                  className="admin-form-control"
                  placeholder="Contoh: 081234567890"
                  value={form.whatsapp}
                  onChange={(e) =>
                    setForm({ ...form, whatsapp: e.target.value })
                  }
                />
                <small
                  style={{
                    color: '#64748b',
                    fontSize: '0.75rem',
                    marginTop: '4px',
                    display: 'block',
                  }}
                >
                  Pembeli akan langsung terhubung ke WhatsApp nomor ini saat
                  menekan tombol "Hubungi via WA".
                </small>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  Jam Operasional Usaha
                </label>
                <input
                  type="text"
                  className="admin-form-control"
                  placeholder="Contoh: 08:00 - 20:00 WIB (Buka Setiap Hari)"
                  value={form.operatingHours}
                  onChange={(e) =>
                    setForm({ ...form, operatingHours: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Alamat Lengkap Usaha</label>
              <textarea
                className="admin-form-control"
                rows={2}
                placeholder="Contoh: Jl. Rayaku No. 15, RT 03/RW 02, Kel. Rawa Arum, Kec. Grogol, Kota Cilegon"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                Link Google Maps (Opsional)
              </label>
              <input
                type="url"
                className="admin-form-control"
                placeholder="https://maps.google.com/..."
                value={form.googleMapsUrl}
                onChange={(e) =>
                  setForm({ ...form, googleMapsUrl: e.target.value })
                }
              />
            </div>
          </div>

          {/* SECTION 3: LEGALITAS & SCAN DOKUMEN (FULL SCAN PROOF ONLY - NO TEXT TYPING!) */}
          <div className="admin-card" style={{ padding: '1.5rem' }}>
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: 'var(--primary-deep)',
                marginBottom: '1.25rem',
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <i
                className="fa-solid fa-file-contract"
                style={{ color: 'var(--accent)' }}
              />
              3. Bukti Scan Dokumen Legalitas Usaha
            </h3>

            {/* Upload Bukti Scan Dokumen Legalitas (Halal, NIB, P-IRT, dll) */}
            <div
              style={{
                background: '#f8fafc',
                padding: '1.25rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
              }}
            >
              <h4
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: 'var(--primary-deep)',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <i
                  className="fa-solid fa-cloud-arrow-up"
                  style={{ color: 'var(--accent)' }}
                />
                Upload File Scan Dokumen Legalitas Usaha
              </h4>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: '#64748b',
                  marginBottom: '1rem',
                }}
              >
                Legalitas usaha dibuktikan dengan mengunggah foto / hasil scan
                surat sertifikat resmi (seperti Sertifikat Halal MUI, NIB Usaha,
                P-IRT, dll).
              </p>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  Unggah Scan Dokumen Legalitas Baru *
                </label>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="text"
                    className="admin-form-control"
                    placeholder="Nama dokumen (contoh: Scan Sertifikat Halal MUI / NIB Usaha)"
                    value={docTitleInput}
                    onChange={(e) => setDocTitleInput(e.target.value)}
                    style={{ flex: 2, minWidth: '240px' }}
                  />
                  <label
                    className="admin-btn admin-btn--primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: uploadingDocScan ? 'wait' : 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      padding: '0.65rem 1.25rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadDocScanFile}
                      disabled={uploadingDocScan}
                      style={{ display: 'none' }}
                    />
                    <i
                      className="fa-solid fa-file-arrow-up"
                      style={{ fontSize: '1rem' }}
                    />
                    {uploadingDocScan
                      ? 'Mengunggah & Kompres...'
                      : '+ Pilih & Upload Scan'}
                  </label>
                </div>
                <small
                  style={{
                    color: '#64748b',
                    fontSize: '0.75rem',
                    marginTop: '6px',
                    display: 'block',
                  }}
                >
                  Ketik nama dokumen (opsional), lalu klik{' '}
                  <strong>+ Pilih &amp; Upload Scan</strong>. File &gt; 1.5MB
                  akan otomatis dikompres.
                </small>
              </div>

              {/* Grid Preview Dokumen Scan */}
              <h5
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: '#334155',
                  marginTop: '1.25rem',
                  marginBottom: '0.75rem',
                }}
              >
                Daftar Dokumen Legalitas Terunggah (
                {(form.certificationDocs || []).length}):
              </h5>

              {(form.certificationDocs || []).length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {(form.certificationDocs || []).map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#fff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      <img
                        src={doc.fileUrl}
                        alt={doc.title}
                        style={{
                          width: '100%',
                          height: '110px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                        }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/assets/potensi_umkm.png';
                        }}
                      />
                      <strong
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--primary-deep)',
                          wordBreak: 'break-word',
                        }}
                      >
                        {doc.title}
                      </strong>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          style={{
                            border: 'none',
                            background: 'none',
                            fontSize: '0.75rem',
                            color: 'var(--accent)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <i className="fa-solid fa-expand" /> Lihat Penuh
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocScan(idx)}
                          style={{
                            border: 'none',
                            background: '#fee2e2',
                            color: '#ef4444',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                          title="Hapus dokumen ini"
                        >
                          <i className="fa-solid fa-trash-can" /> Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <small style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                  Belum ada file scan dokumen legalitas yang diunggah.
                </small>
              )}
            </div>
          </div>

          {/* SECTION 4: FOTO UTAMA & GALERI FOTO */}
          <div className="admin-card" style={{ padding: '1.5rem' }}>
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: 'var(--primary-deep)',
                marginBottom: '1.25rem',
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <i
                className="fa-solid fa-image"
                style={{ color: 'var(--accent)' }}
              />
              4. Foto Sampul &amp; Galeri Dokumentasi Usaha
            </h3>

            {/* Main Cover Image */}
            <div className="admin-form-group">
              <label className="admin-form-label">
                Foto Sampul Utama Usaha *
              </label>
              <div
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <img
                  src={form.imageUrl}
                  alt="Preview Utama"
                  style={{
                    width: '140px',
                    height: '90px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/assets/potensi_umkm.png';
                  }}
                />
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <label
                    className="admin-btn admin-btn--outline"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: uploadingMainImage ? 'wait' : 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      padding: '0.6rem 1.1rem',
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadMainImage}
                      disabled={uploadingMainImage}
                      style={{ display: 'none' }}
                    />
                    <i
                      className="fa-solid fa-cloud-arrow-up"
                      style={{ color: 'var(--accent)', fontSize: '1rem' }}
                    />
                    {uploadingMainImage
                      ? 'Mengunggah & Kompres Foto...'
                      : 'Ganti Foto Sampul Utama'}
                  </label>
                  <small
                    style={{
                      color: '#64748b',
                      fontSize: '0.75rem',
                      marginTop: '6px',
                      display: 'block',
                    }}
                  >
                    <strong>Rekomendasi ukuran:</strong> Rasio 16:9 / 4:3
                    (contoh: 1200×675 px / 800×600 px). Otomatis kompres jika
                    &gt; 1.5MB.
                  </small>
                </div>
              </div>
            </div>

            {/* Gallery Images Grid */}
            <div className="admin-form-group" style={{ marginTop: '1.75rem' }}>
              <label className="admin-form-label">
                Foto Galeri Pendukung Usaha ({(form.images || []).length} foto
                terunggah)
              </label>
              <small
                style={{
                  color: '#64748b',
                  fontSize: '0.75rem',
                  marginBottom: '1rem',
                  display: 'block',
                }}
              >
                Unggah dokumentasi suasana tempat usaha, daftar produk, atau
                kegiatan operasional. Anda dapat memilih banyak foto sekaligus
                dari perangkat Anda.
              </small>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '1rem',
                }}
              >
                {/* Plus Add Photo Card */}
                <label
                  style={{
                    height: '95px',
                    border: '2px dashed #38bdf8',
                    borderRadius: '10px',
                    background: '#f0f9ff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: uploadingGalleryImage ? 'wait' : 'pointer',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.background = '#e0f2fe';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#38bdf8';
                    e.currentTarget.style.background = '#f0f9ff';
                  }}
                  title="Klik untuk memilih foto galeri (Bisa pilih banyak foto sekaligus)"
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadGalleryImage}
                    disabled={uploadingGalleryImage}
                    style={{ display: 'none' }}
                  />
                  <i
                    className="fa-solid fa-square-plus"
                    style={{ fontSize: '1.6rem', color: '#0284c7' }}
                  />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: 'var(--primary-deep)',
                      textAlign: 'center',
                      padding: '0 4px',
                    }}
                  >
                    {uploadingGalleryImage ? 'Memproses...' : '+ Tambah Foto'}
                  </span>
                </label>

                {/* Display Added Gallery Images Thumbnails */}
                {(form.images || []).map((url, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid #cbd5e1',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    }}
                  >
                    <img
                      src={url}
                      alt={`Galeri ${idx + 1}`}
                      style={{
                        width: '100%',
                        height: '95px',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/potensi_umkm.png';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                      }}
                      title="Hapus foto galeri ini"
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 5: KATALOG MENU & TARIF JASA */}
          <div className="admin-card" style={{ padding: '1.5rem' }}>
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: 'var(--primary-deep)',
                marginBottom: '1.25rem',
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <i
                className="fa-solid fa-list-check"
                style={{ color: 'var(--accent)' }}
              />
              5. Katalog Menu Produk / Daftar Tarif Jasa
            </h3>

            <div
              style={{
                background: '#f8fafc',
                padding: '1.25rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                marginBottom: '1.5rem',
              }}
            >
              <h4
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: 'var(--primary-deep)',
                  marginBottom: '1rem',
                }}
              >
                + Tambah Item Menu Baru Ke Katalog Usaha:
              </h4>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Nama Menu / Varian Layanan *
                  </label>
                  <input
                    type="text"
                    className="admin-form-control"
                    placeholder="Contoh: Keripik Singkong Balado (250g) / Cuci AC 1 PK"
                    value={catalogName}
                    onChange={(e) => setCatalogName(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Harga / Tarif Layanan
                  </label>
                  <input
                    type="text"
                    className="admin-form-control"
                    placeholder="Contoh: Rp 15.000 / Rp 75.000"
                    value={catalogPrice}
                    onChange={handlePriceInputChange}
                  />
                </div>
              </div>

              <div
                className="admin-form-group"
                style={{ marginBottom: '1rem' }}
              >
                <label className="admin-form-label">
                  Deskripsi Singkat Item / Porsi
                </label>
                <input
                  type="text"
                  className="admin-form-control"
                  placeholder="Contoh: Singkong renyah gurih dengan bumbu balado rumahan khas Rawa Arum"
                  value={catalogDesc}
                  onChange={(e) => setCatalogDesc(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={handleAddCatalogItem}
              >
                <i className="fa-solid fa-plus" /> Tambahkan Ke Daftar Katalog
                Menu
              </button>
            </div>

            {/* List of Added Catalog Items */}
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                color: 'var(--primary-deep)',
                marginBottom: '1rem',
              }}
            >
              Daftar Menu &amp; Tarif Yang Sudah Terdaftar (
              {form.itemsList.length}):
            </h4>

            {form.itemsList.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {form.itemsList.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '1rem 1.25rem',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div>
                      <strong
                        style={{
                          fontSize: '1rem',
                          color: 'var(--primary-deep)',
                        }}
                      >
                        {item.name}
                      </strong>
                      <span
                        style={{
                          marginLeft: '12px',
                          color: '#16a34a',
                          fontWeight: 900,
                          fontSize: '0.9rem',
                          background: '#dcfce7',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '50px',
                        }}
                      >
                        {formatPriceBadge(item.price)}
                      </span>
                      {item.description && (
                        <p
                          style={{
                            margin: '4px 0 0 0',
                            fontSize: '0.85rem',
                            color: '#64748b',
                          }}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCatalogItem(idx)}
                      style={{
                        background: '#fee2e2',
                        border: 'none',
                        color: '#ef4444',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                      title="Hapus menu ini"
                    >
                      <i
                        className="fa-solid fa-trash-can"
                        style={{ marginRight: '4px' }}
                      />{' '}
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px dashed #cbd5e1',
                  color: '#64748b',
                }}
              >
                Belum ada item menu atau tarif layanan yang ditambahkan. Silakan
                isi form di atas dan tekan{' '}
                <strong>"Tambahkan Ke Daftar Katalog Menu"</strong>.
              </div>
            )}
          </div>

          {/* Sticky Bottom Save Action Bar */}
          <div
            style={{
              position: 'sticky',
              bottom: '1.5rem',
              background: '#fff',
              padding: '1.25rem 2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              border: '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 100,
            }}
          >
            <div style={{ fontSize: '0.9rem', color: '#475569' }}>
              <strong>Status Usaha:</strong>{' '}
              {form.isVerified
                ? '✅ Terverifikasi Binaan'
                : '⏳ Belum Terverifikasi'}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                className="admin-btn admin-btn--outline"
                onClick={() => setCurrentView('list')}
              >
                Batal
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn--primary"
                disabled={submitting}
                style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
              >
                <i
                  className="fa-solid fa-floppy-disk"
                  style={{ marginRight: '8px' }}
                />
                {submitting
                  ? 'Menyimpan...'
                  : editorMode === 'create'
                    ? 'Simpan Usaha Baru'
                    : 'Perbarui Data Usaha'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: MAIN TABLE LIST VIEW
  // =========================================================================
  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            <i
              className="fa-solid fa-store"
              style={{ color: 'var(--accent)', marginRight: '8px' }}
            />
            Katalog UMKM Binaan
          </h1>
          <p className="admin-page-subtitle">
            Kelola profil usaha produk &amp; jasa warga Kelurahan Rawa Arum
            secara rinci.
          </p>
        </div>

        <button
          className="admin-btn admin-btn--primary"
          onClick={handleOpenCreate}
        >
          <i className="fa-solid fa-plus" /> Tambah Usaha Baru
        </button>
      </div>

      {error && (
        <div
          className="admin-alert admin-alert--error"
          style={{ marginBottom: '1.5rem' }}
        >
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="admin-stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-stat-card">
          <div
            className="admin-stat-icon"
            style={{ background: '#e0f2fe', color: '#0284c7' }}
          >
            <i className="fa-solid fa-store" />
          </div>
          <div>
            <div className="admin-stat-value">{umkms.length}</div>
            <div className="admin-stat-label">Total UMKM Binaan</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="admin-stat-icon"
            style={{ background: '#ffedd5', color: '#ea580c' }}
          >
            <i className="fa-solid fa-bag-shopping" />
          </div>
          <div>
            <div className="admin-stat-value">{totalProduk}</div>
            <div className="admin-stat-label">Produk &amp; Kuliner</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="admin-stat-icon"
            style={{ background: '#e0e7ff', color: '#4f46e5' }}
          >
            <i className="fa-solid fa-wrench" />
          </div>
          <div>
            <div className="admin-stat-value">{totalJasa}</div>
            <div className="admin-stat-label">Jasa &amp; Layanan</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="admin-stat-icon"
            style={{ background: '#dcfce7', color: '#15803d' }}
          >
            <i className="fa-solid fa-certificate" />
          </div>
          <div>
            <div className="admin-stat-value">{totalVerified}</div>
            <div className="admin-stat-label">Terverifikasi Resmi</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="admin-stat-icon"
            style={{ background: '#d1fae5', color: '#059669' }}
          >
            <i className="fa-brands fa-whatsapp" />
          </div>
          <div>
            <div className="admin-stat-value">{totalWaClicks}</div>
            <div className="admin-stat-label">Total Klik WhatsApp</div>
          </div>
        </div>
      </div>

      {/* Main Table & Filter Section */}
      <div className="admin-card">
        <div
          className="admin-card__header"
          style={{
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '1px solid #edf2f7',
          }}
        >
          <div
            className="admin-tabs"
            style={{ marginBottom: 0, borderBottom: 'none' }}
          >
            {[
              { label: 'Semua UMKM', value: 'all' },
              { label: 'Produk & Kuliner', value: 'produk' },
              { label: 'Jasa & Layanan', value: 'jasa' },
              { label: 'Terverifikasi', value: 'verified' },
            ].map((tab) => (
              <button
                key={tab.value}
                className={`admin-tab-btn ${filterCategory === tab.value ? 'active' : ''}`}
                onClick={() => setFilterCategory(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <i
              className="fa-solid fa-magnifying-glass"
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              className="admin-form-control"
              placeholder="Cari nama usaha, pemilik, alamat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '2.5rem',
                height: '38px',
                fontSize: '0.85rem',
              }}
            />
          </div>
        </div>

        <div className="admin-card__body" style={{ padding: 0 }}>
          <div className="admin-table-wrapper">
            {filteredUmkms.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Foto Sampul</th>
                    <th>Nama Usaha &amp; Pemilik</th>
                    <th>Jenis &amp; Sub-Kategori</th>
                    <th>Kontak WA &amp; Alamat</th>
                    <th>Verifikasi</th>
                    <th style={{ textAlign: 'center' }}>Klik WA</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUmkms.map((item) => (
                    <tr key={item._id}>
                      <td style={{ width: '80px' }}>
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          style={{
                            width: '60px',
                            height: '40px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                          }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/assets/potensi_umkm.png';
                          }}
                        />
                      </td>
                      <td>
                        <strong
                          style={{
                            display: 'block',
                            color: 'var(--primary-deep)',
                            fontSize: '0.95rem',
                          }}
                        >
                          {item.title}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Pemilik: {item.ownerName || 'Warga Rawa Arum'}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '50px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background:
                              item.categoryType === 'jasa'
                                ? '#e0f2fe'
                                : '#ffedd5',
                            color:
                              item.categoryType === 'jasa'
                                ? '#0369a1'
                                : '#c2410c',
                          }}
                        >
                          {item.categoryType === 'jasa' ? 'Jasa' : 'Produk'}{' '}
                          &bull; {item.subCategory}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                          <i
                            className="fa-brands fa-whatsapp"
                            style={{ color: '#25d366', marginRight: '5px' }}
                          />
                          {item.whatsapp || '-'}
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#64748b',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '200px',
                          }}
                        >
                          {item.address || '-'}
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleVerify(item._id)}
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          title="Klik untuk mengubah verifikasi"
                        >
                          {item.isVerified ? (
                            <span
                              style={{
                                color: '#16a34a',
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <i className="fa-solid fa-circle-check" />{' '}
                              Terverifikasi
                            </span>
                          ) : (
                            <span
                              style={{ color: '#94a3b8', fontSize: '0.8rem' }}
                            >
                              <i className="fa-regular fa-circle" /> Belum
                            </span>
                          )}
                        </button>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            color: '#059669',
                            background: '#d1fae5',
                            padding: '0.2rem 0.65rem',
                            borderRadius: '50px',
                          }}
                        >
                          <i className="fa-brands fa-whatsapp" />
                          {item.whatsappClicksCount || 0}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            className="admin-btn admin-btn--outline admin-btn--sm"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Data UMKM"
                          >
                            <i
                              className="fa-solid fa-pen-to-square"
                              style={{ marginRight: '4px' }}
                            />{' '}
                            Edit Full Workspace
                          </button>
                          <button
                            className="admin-btn admin-btn--outline admin-btn--sm"
                            onClick={() => setDeleteConfirmId(item._id)}
                            style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                            title="Hapus Usaha"
                          >
                            <i className="fa-solid fa-trash-can" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty-state">
                <i className="fa-solid fa-store-slash admin-empty-icon" />
                <h3>Belum Ada Data UMKM</h3>
                <p>
                  Silakan tambahkan data usaha baru warga Kelurahan Rawa Arum.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '400px' }}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">Hapus Data UMKM</h3>
            </div>
            <div className="admin-modal__body">
              <p>
                Apakah Anda yakin ingin menghapus data usaha ini secara
                permanen?
              </p>
            </div>
            <div className="admin-modal__footer">
              <button
                className="admin-btn admin-btn--outline"
                onClick={() => setDeleteConfirmId(null)}
              >
                Batal
              </button>
              <button
                className="admin-btn admin-btn--primary"
                style={{ background: '#ef4444' }}
                onClick={() => handleDeleteUmkm(deleteConfirmId)}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Lightbox Popup Modal */}
      <DocPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
};

export default AdminUmkmPage;
