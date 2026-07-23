import { useState, useEffect } from 'react';
import { fetchPrograms } from '../services/api';

const Roadmap = () => {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const loadPrograms = async () => {
      const data = await fetchPrograms();
      setPrograms(data);
    };
    loadPrograms();
  }, []);

  return (
    <section className="roadmap-section" id="program">
      <div className="container">
        <div className="section-header" data-watermark="PROGRAM">
          <span className="section-tag">Rencana Strategis</span>
          <h2 className="section-title">Program Kerja Resmi</h2>
          <div className="title-underline"></div>
        </div>

        <div className="roadmap-timeline">
          <div className="timeline-line"></div>
          
          {programs.length > 0 ? (
            programs.map((item, idx) => (
              <div key={item._id || idx} className="timeline-item">
                <div className="timeline-dot"><i className={`fa-solid ${item.icon || 'fa-briefcase'}`}></i></div>
                <div className="timeline-content">
                  <span className="timeline-year" style={{ background: 'var(--accent)', color: '#fff', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem' }}>
                    {item.category || 'Umum'}
                  </span>
                  <h4 className="timeline-title" style={{ marginTop: '6px' }}>{item.title}</h4>
                  <p className="timeline-desc" dangerouslySetInnerHTML={{ __html: item.description }}></p>
                  <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <strong>Sasaran:</strong> {item.target} &bull; <strong>Status:</strong> {item.status}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="timeline-item">
              <div className="timeline-dot"><i className="fa-solid fa-briefcase"></i></div>
              <div className="timeline-content">
                <h4 className="timeline-title">Belum ada program kerja terdaftar</h4>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
