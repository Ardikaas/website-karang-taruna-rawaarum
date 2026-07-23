import { useState, useEffect } from "react";

import { fetchInfoItems } from "../services/api";

const PengumumanPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchInfoItems("pengumuman");
      setItems(data);
      setLoading(false);
    };

    loadData();
    window.scrollTo(0, 0);
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <section
      className="informasi-section"
      style={{ paddingTop: "140px", minHeight: "80vh" }}
    >
      <div className="container">
        <div className="section-header" data-watermark="NOTICE">
          <span className="section-tag">Papan Pengumuman Resmi</span>
          <h2 className="section-title">Pengumuman Penting</h2>
          <div className="title-underline"></div>
        </div>

        {/* Search Control */}
        <div className="info-controls">
          <div className="info-search-wrapper">
            <i className="fa-solid fa-magnifying-glass info-search-icon"></i>
            <input
              type="text"
              className="info-search-input"
              placeholder="Cari surat edaran, rilis pengumuman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "var(--text-secondary)",
            }}
          >
            <i
              className="fa-solid fa-circle-notch fa-spin"
              style={{
                fontSize: "2rem",
                marginBottom: "1rem",
                color: "var(--accent)",
              }}
            ></i>
            <p>Memuat pengumuman...</p>
          </div>
        ) : (
          <div className="grid-informasi">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <article key={item._id} className="info-card">
                  <div className="info-image-wrapper">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="info-image"
                    />
                    <div className="info-tag-badge warning">{item.badge}</div>
                  </div>
                  <div className="info-content">
                    <div className="info-meta">
                      <span>
                        <i
                          className="fa-regular fa-calendar"
                          style={{ marginRight: "6px" }}
                        ></i>{" "}
                        {item.date}
                      </span>
                    </div>
                    <h3 className="info-title">{item.title}</h3>
                    <p className="info-desc" dangerouslySetInnerHTML={{ __html: item.description }}></p>
                    <a href="#kontak" className="info-btn">
                      {item.linkText}{" "}
                      <i className="fa-solid fa-arrow-right-long"></i>
                    </a>
                  </div>
                </article>
              ))
            ) : (
              <div className="info-empty">
                <i className="fa-solid fa-bullhorn info-empty-icon"></i>
                <p>Belum ada rilis pengumuman baru dari Kelurahan Rawa Arum.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default PengumumanPage;
