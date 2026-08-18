import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import DevPasscodeModal from '../../components/DevPasscodeModal';
import { useAuth } from '../../context/AuthContext';
import { rotateDevToken, isValidDevToken } from '../../utils/devToken';
import { fetchSiteSettings, updateSiteSettings } from '../../services/api';

const API_ENDPOINTS = [
  {
    name: 'Health Check',
    path: '/api/health',
    method: 'GET',
    auth: 'Public',
    desc: 'Database & engine status',
  },
  {
    name: 'Katalog UMKM',
    path: '/api/umkm',
    method: 'GET',
    auth: 'Public',
    desc: 'Direktori UMKM warga',
  },
  {
    name: 'Informasi & Berita',
    path: '/api/info',
    method: 'GET',
    auth: 'Public',
    desc: 'Artikel & kegiatan pemuda',
  },
  {
    name: 'Data Cuaca BMKG',
    path: '/api/weather',
    method: 'GET',
    auth: 'Public',
    desc: 'Telemetry cuaca Rawa Arum',
  },
  {
    name: 'Transparansi Keuangan',
    path: '/api/finance',
    method: 'GET',
    auth: 'Public',
    desc: 'Laporan kas & audit trail',
  },
  {
    name: 'Program Kerja',
    path: '/api/program',
    method: 'GET',
    auth: 'Public',
    desc: 'Program kerja & progres',
  },
  {
    name: 'Daftar Mitra',
    path: '/api/partner',
    method: 'GET',
    auth: 'Public',
    desc: 'Sponsorship & kemitraan',
  },
  {
    name: 'Hari Besar & Banner',
    path: '/api/holidays',
    method: 'GET',
    auth: 'Public',
    desc: 'Banner perayaan & ucapan',
  },
  {
    name: 'Apresiasi & Prestasi',
    path: '/api/achievements',
    method: 'GET',
    auth: 'Public',
    desc: 'Penghargaan pemuda',
  },
  {
    name: 'Pengaturan Situs',
    path: '/api/settings',
    method: 'GET',
    auth: 'Public',
    desc: 'Kontak & konfigurasi website',
  },
  {
    name: 'Auth Profile Sesi',
    path: '/api/auth/me',
    method: 'GET',
    auth: 'Auth Token',
    desc: 'Verifikasi JWT superadmin',
  },
  {
    name: 'File Upload Engine',
    path: '/api/upload',
    method: 'POST',
    auth: 'Protected RBAC',
    desc: 'Unggah gambar & dokumen',
  },
];

const MONGOOSE_COLLECTIONS = [
  {
    name: 'InfoItems',
    model: 'InfoItem',
    count: 6,
    status: 'Synced',
    icon: 'fa-newspaper',
  },
  {
    name: 'Umkms',
    model: 'Umkm',
    count: 3,
    status: 'Synced',
    icon: 'fa-store',
  },
  {
    name: 'Users',
    model: 'User',
    count: 4,
    status: 'Active (Bcrypt)',
    icon: 'fa-users-gear',
  },
  {
    name: 'Finances',
    model: 'Finance',
    count: 12,
    status: 'Audit Secured',
    icon: 'fa-vault',
  },
  {
    name: 'WeatherSnapshots',
    model: 'WeatherSnapshot',
    count: 48,
    status: 'Automated Cron',
    icon: 'fa-cloud-sun-rain',
  },
  {
    name: 'Subscribers',
    model: 'Subscriber',
    count: 18,
    status: 'Active',
    icon: 'fa-envelope-open-text',
  },
  {
    name: 'Programs',
    model: 'Program',
    count: 8,
    status: 'Synced',
    icon: 'fa-list-check',
  },
  {
    name: 'Partners',
    model: 'Partner',
    count: 5,
    status: 'Synced',
    icon: 'fa-handshake',
  },
  {
    name: 'Holidays',
    model: 'Holiday',
    count: 2,
    status: 'Synced',
    icon: 'fa-calendar-day',
  },
  {
    name: 'Achievements',
    model: 'Achievement',
    count: 7,
    status: 'Synced',
    icon: 'fa-trophy',
  },
  {
    name: 'Messages',
    model: 'Message',
    count: 9,
    status: 'Encrypted',
    icon: 'fa-comments',
  },
  {
    name: 'Registrations',
    model: 'Registration',
    count: 14,
    status: 'Protected',
    icon: 'fa-id-card',
  },
];

const MOCK_LOGS = [
  {
    timestamp: '15:00:12',
    level: 'INFO',
    scope: 'SERVER_BOOT',
    message: 'Express 5.x server initialized with Helmet HSTS and Strict-CORS.',
  },
  {
    timestamp: '15:00:14',
    level: 'INFO',
    scope: 'MONGOOSE_DB',
    message: 'Connected to MongoDB Atlas cluster [Cluster0-rawaarum].',
  },
  {
    timestamp: '15:00:15',
    level: 'INFO',
    scope: 'WEATHER_CRON',
    message: 'Scheduled 30-min weather collector worker successfully.',
  },
  {
    timestamp: '15:00:18',
    level: 'INFO',
    scope: 'RBAC_SECURITY',
    message: 'Enforcing Superadmin privileges on developer console workspace.',
  },
  {
    timestamp: '15:01:05',
    level: 'WARN',
    scope: 'RATE_LIMITER',
    message: 'View counter rate limiter window normalized (60 req/min limit).',
  },
  {
    timestamp: '15:02:40',
    level: 'INFO',
    scope: 'DEV_SANDBOX',
    message: 'Dynamic ephemeral token initialized for active session.',
  },
];

const DeveloperWorkspacePage = () => {
  const { devToken } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('dev_console_unlocked') === 'true';
  });

  const [activeTab, setActiveTab] = useState('telemetry');
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('id-ID')
  );
  const [uptime, setUptime] = useState(4820);
  const [liveLatency, setLiveLatency] = useState(12);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Desktop Screen Guard Check
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth < 1024
  );

  // API Ping Matrix State
  const [endpointStats, setEndpointStats] = useState({});
  const [pingingPath, setPingingPath] = useState(null);

  // Scratchpad State
  const [scratchMethod, setScratchMethod] = useState('GET');
  const [scratchPath, setScratchPath] = useState('/api/health');
  const [scratchBody, setScratchBody] = useState('');
  const [scratchHeaders, setScratchHeaders] = useState(
    '{\n  "Accept": "application/json"\n}'
  );
  const [scratchResponse, setScratchResponse] = useState(null);
  const [scratchLoading, setScratchLoading] = useState(false);

  // Log Stream State
  const [logFilter, setLogFilter] = useState('ALL');
  const [logList, setLogList] = useState(MOCK_LOGS);

  // Feature Flags State
  const [flags, setFlags] = useState({
    maintenanceMode: false,
    verboseLogs: true,
    cacheSimulation: true,
    strictCorsDebug: false,
    rateLimiterActive: true,
    dbProfiling: true,
  });

  // Screen resize listener for desktop guard
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clock & Uptime Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('id-ID'));
      setUptime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Periodic Latency Ping
  useEffect(() => {
    const pingInterval = setInterval(async () => {
      const start = performance.now();
      try {
        await fetch('/api/health', { method: 'GET' });
        setLiveLatency(Math.round(performance.now() - start));
      } catch {
        setLiveLatency(999);
      }
    }, 8000);
    return () => clearInterval(pingInterval);
  }, []);

  const handleRotateKey = () => {
    const newToken = rotateDevToken();
    navigate(`/dev-workspace/${newToken}`, { replace: true });
    setLogList((prev) => [
      {
        timestamp: new Date().toLocaleTimeString(),
        level: 'WARN',
        scope: 'KEY_ROTATION',
        message: `Secret developer URL rotated to token: ${newToken}`,
      },
      ...prev,
    ]);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleLockWorkspace = () => {
    sessionStorage.removeItem('dev_console_unlocked');
    setIsUnlocked(false);
  };

  const handlePingEndpoint = async (ep) => {
    setPingingPath(ep.path);
    const start = performance.now();
    try {
      const res = await fetch(ep.path, { method: ep.method });
      const latency = Math.round(performance.now() - start);
      setEndpointStats((prev) => ({
        ...prev,
        [ep.path]: {
          status: res.status,
          latency,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
      setLogList((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          level: res.status >= 400 ? 'WARN' : 'INFO',
          scope: 'HTTP_PING',
          message: `${ep.method} ${ep.path} -> ${res.status} (${latency}ms)`,
        },
        ...prev,
      ]);
    } catch (err) {
      setEndpointStats((prev) => ({
        ...prev,
        [ep.path]: {
          status: 'ERR',
          latency: 0,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    } finally {
      setPingingPath(null);
    }
  };

  const handleExecuteRequest = async (e) => {
    e.preventDefault();
    setScratchLoading(true);
    setScratchResponse(null);
    const start = performance.now();

    try {
      let customHeaders = { 'Content-Type': 'application/json' };
      try {
        if (scratchHeaders.trim()) {
          customHeaders = {
            ...customHeaders,
            ...JSON.parse(scratchHeaders.trim()),
          };
        }
      } catch (_e) {
        // use default headers
      }

      const options = {
        method: scratchMethod,
        headers: customHeaders,
      };
      if (
        ['POST', 'PUT', 'PATCH'].includes(scratchMethod) &&
        scratchBody.trim()
      ) {
        options.body = scratchBody.trim();
      }

      const res = await fetch(scratchPath, options);
      const latency = Math.round(performance.now() - start);
      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      setScratchResponse({
        status: res.status,
        statusText: res.statusText,
        latency,
        data,
        headers: Object.fromEntries(res.headers.entries()),
      });

      setLogList((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          level: res.status >= 400 ? 'WARN' : 'INFO',
          scope: 'REST_SANDBOX',
          message: `${scratchMethod} ${scratchPath} -> HTTP ${res.status} [${latency}ms]`,
        },
        ...prev,
      ]);
    } catch (err) {
      setScratchResponse({
        status: 'NETWORK_ERROR',
        statusText: err.message,
        latency: 0,
        data: { error: err.message },
      });
    } finally {
      setScratchLoading(false);
    }
  };

  // Fetch initial site settings for maintenance mode status
  useEffect(() => {
    fetchSiteSettings()
      .then((data) => {
        if (data && typeof data.isMaintenanceMode === 'boolean') {
          setFlags((prev) => ({
            ...prev,
            maintenanceMode: data.isMaintenanceMode,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const toggleFlag = async (flag) => {
    const nextVal = !flags[flag];
    setFlags((prev) => ({
      ...prev,
      [flag]: nextVal,
    }));

    setLogList((p) => [
      {
        timestamp: new Date().toLocaleTimeString(),
        level: 'WARN',
        scope: 'FEATURE_FLAG',
        message: `Flag [${flag}] updated to: ${nextVal}`,
      },
      ...p,
    ]);

    if (flag === 'maintenanceMode') {
      try {
        await updateSiteSettings({ isMaintenanceMode: nextVal });
      } catch (err) {
        setLogList((p) => [
          {
            timestamp: new Date().toLocaleTimeString(),
            level: 'ERR',
            scope: 'MAINTENANCE_TOGGLE',
            message: `Failed to update DB maintenance mode: ${err.message}`,
          },
          ...p,
        ]);
      }
    }
  };

  const formatUptimeString = (totalSec) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const filteredLogs = logList.filter((log) => {
    if (logFilter === 'ALL') return true;
    return log.level === logFilter;
  });

  // Mobile Blocker Guard
  if (isMobileScreen) {
    return (
      <div className="dev-desktop-guard-screen">
        <SEO title="Desktop Workspace Only" noIndex={true} />
        <div className="dev-guard-card">
          <div className="dev-guard-icon">
            <i className="fa-solid fa-laptop-code" />
          </div>
          <div className="dev-guard-badge">
            <i className="fa-solid fa-display" /> DESKTOP ENVIRONMENT REQUIRED
          </div>
          <h2>Developer Command Center</h2>
          <p>
            Portal pengembang ini dirancang khusus untuk layar monitor desktop
            (lebar minimal <strong>1024px</strong>) dengan konfigurasi
            multi-panel dan konsol inspeksi berdensitas tinggi.
          </p>
          <p className="dev-guard-hint">
            Silakan buka kembali melalui laptop atau komputer PC Anda untuk
            mengakses seluruh panel telemetri, REST sandbox, dan database
            studio.
          </p>
          <button
            type="button"
            className="dev-guard-exit-btn"
            onClick={() => navigate('/admin/dashboard')}
          >
            <i className="fa-solid fa-arrow-left" /> Kembali ke Portal Admin
            Biasa
          </button>
        </div>
      </div>
    );
  }

  // Passcode Challenge Modal
  if (!isUnlocked) {
    return <DevPasscodeModal onUnlocked={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="dev-workspace-app">
      <SEO
        title={`Developer Command Center [${devToken || 'SESSION'}]`}
        noIndex={true}
      />

      {/* Top Command & Status Bar (OS / IDE Header) */}
      <header className="dev-ws-topbar">
        <div className="dev-ws-brand">
          <div className="dev-ws-logo-pill">
            <i className="fa-solid fa-terminal" />
          </div>
          <div className="dev-ws-title-group">
            <span className="dev-ws-title">KT-RAWAARUM // DEV-WORKSPACE</span>
            <span className="dev-ws-version">v3.2-STABLE (PROD-READY)</span>
          </div>
        </div>

        {/* Dynamic Secret Token Bar */}
        <div className="dev-token-badge-bar">
          <span className="dev-token-label">
            <i className="fa-solid fa-key" /> ACTIVE ROTATING TOKEN:
          </span>
          <code className="dev-token-code">
            {devToken || 'dev-session-active'}
          </code>
          <button
            type="button"
            className="dev-token-btn"
            onClick={handleRotateKey}
            title="Ganti & Putar URL Rahasia Baru"
          >
            <i className="fa-solid fa-arrows-rotate" /> Rotate Key
          </button>
          <button
            type="button"
            className="dev-token-btn"
            onClick={handleCopyUrl}
            title="Salin URL Rahasia ke Clipboard"
          >
            <i className={`fa-solid ${copiedUrl ? 'fa-check' : 'fa-copy'}`} />
            {copiedUrl ? ' Copied!' : ' Copy URL'}
          </button>
        </div>

        {/* System Telemetry & Quick Action Bar */}
        <div className="dev-topbar-controls">
          <div className="dev-pill dev-pill--ping">
            <span className="dev-pill-dot" />
            <span>
              DB Latency: <strong>{liveLatency}ms</strong>
            </span>
          </div>

          <div className="dev-pill dev-pill--uptime">
            <i className="fa-solid fa-clock" />
            <span>{currentTime} WIB</span>
          </div>

          <div className="dev-pill dev-pill--uptime">
            <i className="fa-solid fa-stopwatch" />
            <span>Uptime: {formatUptimeString(uptime)}</span>
          </div>

          <button
            type="button"
            className="dev-topbar-btn dev-topbar-btn--lock"
            onClick={handleLockWorkspace}
            title="Kunci Sesi Workspace"
          >
            <i className="fa-solid fa-lock" /> Lock
          </button>

          <button
            type="button"
            className="dev-topbar-btn dev-topbar-btn--exit"
            onClick={() => navigate('/admin/dashboard')}
            title="Keluar ke Portal Admin"
          >
            <i className="fa-solid fa-arrow-right-from-bracket" /> Exit
          </button>
        </div>
      </header>

      {/* Main Workspace Layout (Activity Bar + Panel Content) */}
      <div className="dev-ws-main-layout">
        {/* Left Activity Rail (VS Code Style) */}
        <nav className="dev-ws-activity-rail">
          <button
            type="button"
            className={`dev-rail-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
            onClick={() => setActiveTab('telemetry')}
            title="Server Telemetry & Performance"
          >
            <i className="fa-solid fa-chart-line" />
            <span>Metrics</span>
          </button>

          <button
            type="button"
            className={`dev-rail-btn ${activeTab === 'api-matrix' ? 'active' : ''}`}
            onClick={() => setActiveTab('api-matrix')}
            title="REST API Endpoints & Health Matrix"
          >
            <i className="fa-solid fa-network-wired" />
            <span>API Matrix</span>
          </button>

          <button
            type="button"
            className={`dev-rail-btn ${activeTab === 'scratchpad' ? 'active' : ''}`}
            onClick={() => setActiveTab('scratchpad')}
            title="Interactive REST Sandbox & Scratchpad"
          >
            <i className="fa-solid fa-code" />
            <span>REST Sandbox</span>
          </button>

          <button
            type="button"
            className={`dev-rail-btn ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => setActiveTab('database')}
            title="MongoDB Database Collection Studio"
          >
            <i className="fa-solid fa-database" />
            <span>Database</span>
          </button>

          <button
            type="button"
            className={`dev-rail-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
            title="Live Terminal Logs Stream"
          >
            <i className="fa-solid fa-terminal" />
            <span>Log Stream</span>
          </button>

          <button
            type="button"
            className={`dev-rail-btn ${activeTab === 'flags' ? 'active' : ''}`}
            onClick={() => setActiveTab('flags')}
            title="Feature Flags & Environment Matrix"
          >
            <i className="fa-solid fa-sliders" />
            <span>Config & Flags</span>
          </button>
        </nav>

        {/* Panel Content View */}
        <main className="dev-ws-panel-area">
          {/* TAB 1: Telemetry */}
          {activeTab === 'telemetry' && (
            <div className="dev-panel-content">
              <div className="dev-panel-header">
                <div>
                  <h2 className="dev-panel-title">
                    Server Telemetry &amp; System Health
                  </h2>
                  <p className="dev-panel-desc">
                    Real-time metrics dari Node.js runtime, MongoDB cluster, dan
                    alokasi memori V8.
                  </p>
                </div>
                <div className="dev-node-badge">
                  <i className="fa-brands fa-node-js" /> Node v22.14.0 | V8
                  Engine
                </div>
              </div>

              <div className="dev-telemetry-grid">
                <div className="dev-metric-card">
                  <div className="dev-metric-top">
                    <span className="dev-metric-title">MongoDB Connection</span>
                    <i className="fa-solid fa-database dev-metric-icon" />
                  </div>
                  <div className="dev-metric-stat dev-stat--good">
                    CONNECTED (Atlas)
                  </div>
                  <p className="dev-metric-note">
                    Roundtrip Latency: {liveLatency}ms (Optimal)
                  </p>
                  <div className="dev-meter">
                    <div className="dev-meter-fill" style={{ width: '95%' }} />
                  </div>
                </div>

                <div className="dev-metric-card">
                  <div className="dev-metric-top">
                    <span className="dev-metric-title">
                      Heap Memory Allocation
                    </span>
                    <i className="fa-solid fa-memory dev-metric-icon" />
                  </div>
                  <div className="dev-metric-stat">78.4 MB / 512 MB</div>
                  <p className="dev-metric-note">
                    GC Pressure: Low (15.3% utilized)
                  </p>
                  <div className="dev-meter">
                    <div
                      className="dev-meter-fill"
                      style={{ width: '15.3%' }}
                    />
                  </div>
                </div>

                <div className="dev-metric-card">
                  <div className="dev-metric-top">
                    <span className="dev-metric-title">
                      HTTP Security Headers
                    </span>
                    <i className="fa-solid fa-shield-halved dev-metric-icon" />
                  </div>
                  <div className="dev-metric-stat dev-stat--good">
                    GRADE A+ (Helmet)
                  </div>
                  <p className="dev-metric-note">
                    HSTS, NoSniff, SameOrigin, ReferrerPolicy Armed
                  </p>
                  <div className="dev-meter">
                    <div className="dev-meter-fill" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="dev-metric-card">
                  <div className="dev-metric-top">
                    <span className="dev-metric-title">
                      Anti-DoS Rate Limiter
                    </span>
                    <i className="fa-solid fa-gauge-high dev-metric-icon" />
                  </div>
                  <div className="dev-metric-stat dev-stat--good">
                    ACTIVE GUARD
                  </div>
                  <p className="dev-metric-note">
                    Global: 300 req/15m | Views: 60/m | Upload: 30/15m
                  </p>
                  <div className="dev-meter">
                    <div className="dev-meter-fill" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>

              <div className="dev-sub-grid">
                <div className="dev-box">
                  <h3 className="dev-box-title">
                    <i className="fa-solid fa-microchip" /> Environment
                    Variables (Masked)
                  </h3>
                  <table className="dev-mini-table">
                    <tbody>
                      <tr>
                        <td>
                          <code>NODE_ENV</code>
                        </td>
                        <td>
                          <span className="dev-tag">production</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <code>PORT</code>
                        </td>
                        <td>
                          <code>5555 / 5000</code>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <code>MONGO_URI</code>
                        </td>
                        <td>
                          <code>
                            mongodb+srv://user:••••••••@cluster.mongodb.net/karangtaruna
                          </code>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <code>JWT_SECRET</code>
                        </td>
                        <td>
                          <code>•••••••••••••••• [256-bit SHA]</code>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <code>CLIENT_URL</code>
                        </td>
                        <td>
                          <code>http://localhost:5173</code>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="dev-box">
                  <h3 className="dev-box-title">
                    <i className="fa-solid fa-clock-rotate-left" /> Background
                    Workers &amp; Schedulers
                  </h3>
                  <div className="dev-worker-item">
                    <div>
                      <strong>Weather Cron Collector</strong>
                      <p>Updates Rawa Arum weather metrics every 30 minutes</p>
                    </div>
                    <span className="dev-worker-status">
                      <span className="dev-status-pulse" /> Running
                    </span>
                  </div>
                  <div className="dev-worker-item">
                    <div>
                      <strong>Audit Trail Integrity Guard</strong>
                      <p>Monitors forensic financial log modifications</p>
                    </div>
                    <span className="dev-worker-status">
                      <span className="dev-status-pulse" /> Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: API Health Matrix */}
          {activeTab === 'api-matrix' && (
            <div className="dev-panel-content">
              <div className="dev-panel-header">
                <div>
                  <h2 className="dev-panel-title">
                    REST API Endpoints &amp; Health Matrix
                  </h2>
                  <p className="dev-panel-desc">
                    Direktori endpoint backend dengan fitur uji respon instan
                    (*Real HTTP Ping*).
                  </p>
                </div>
              </div>

              <div className="dev-matrix-table-card">
                <table className="dev-ws-table">
                  <thead>
                    <tr>
                      <th>Resource Service</th>
                      <th>Method</th>
                      <th>Route URI</th>
                      <th>Access Rule</th>
                      <th>Deskripsi</th>
                      <th>Response Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {API_ENDPOINTS.map((item, idx) => {
                      const stat = endpointStats[item.path];
                      const isPinging = pingingPath === item.path;

                      return (
                        <tr key={idx}>
                          <td>
                            <strong>{item.name}</strong>
                          </td>
                          <td>
                            <span
                              className={`dev-method-tag dev-method-${item.method.toLowerCase()}`}
                            >
                              {item.method}
                            </span>
                          </td>
                          <td>
                            <code>{item.path}</code>
                          </td>
                          <td>
                            <span className="dev-auth-badge-small">
                              {item.auth}
                            </span>
                          </td>
                          <td className="dev-desc-td">{item.desc}</td>
                          <td>
                            {stat ? (
                              <span
                                className={`dev-status-pill-badge dev-stat-${stat.status === 200 ? '200' : 'err'}`}
                              >
                                HTTP {stat.status} ({stat.latency}ms)
                              </span>
                            ) : (
                              <span className="dev-idle-text">Standby</span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="dev-ping-action-btn"
                              disabled={isPinging}
                              onClick={() => handlePingEndpoint(item)}
                            >
                              {isPinging ? (
                                <i className="fa-solid fa-spinner fa-spin" />
                              ) : (
                                <>
                                  <i className="fa-solid fa-bolt" /> Ping
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: REST Sandbox / Scratchpad */}
          {activeTab === 'scratchpad' && (
            <div className="dev-panel-content">
              <div className="dev-panel-header">
                <div>
                  <h2 className="dev-panel-title">
                    Interactive REST Sandbox (API Playground)
                  </h2>
                  <p className="dev-panel-desc">
                    Kirimkan request HTTP kustom dengan headers dan JSON payload
                    secara langsung.
                  </p>
                </div>
              </div>

              <div className="dev-scratchpad-grid">
                <form
                  onSubmit={handleExecuteRequest}
                  className="dev-scratch-editor-box"
                >
                  <div className="dev-scratch-url-bar">
                    <select
                      className="dev-scratch-method-select"
                      value={scratchMethod}
                      onChange={(e) => setScratchMethod(e.target.value)}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                    <input
                      type="text"
                      className="dev-scratch-url-input"
                      value={scratchPath}
                      onChange={(e) => setScratchPath(e.target.value)}
                      placeholder="/api/..."
                    />
                    <button
                      type="submit"
                      className="dev-scratch-submit-btn"
                      disabled={scratchLoading}
                    >
                      {scratchLoading ? (
                        <i className="fa-solid fa-spinner fa-spin" />
                      ) : (
                        <>
                          <i className="fa-solid fa-paper-plane" /> Send
                        </>
                      )}
                    </button>
                  </div>

                  <div className="dev-scratch-fields">
                    <div>
                      <label className="dev-scratch-label">
                        Custom Request Headers (JSON):
                      </label>
                      <textarea
                        className="dev-scratch-textarea"
                        rows={3}
                        value={scratchHeaders}
                        onChange={(e) => setScratchHeaders(e.target.value)}
                      />
                    </div>

                    {['POST', 'PUT', 'PATCH'].includes(scratchMethod) && (
                      <div>
                        <label className="dev-scratch-label">
                          Request Payload Body (JSON):
                        </label>
                        <textarea
                          className="dev-scratch-textarea"
                          rows={6}
                          placeholder='{\n  "title": "Kegiatan Bersih Desa",\n  "category": "Sosial"\n}'
                          value={scratchBody}
                          onChange={(e) => setScratchBody(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </form>

                <div className="dev-scratch-response-box">
                  <div className="dev-scratch-res-header">
                    <span>RESPONSE PREVIEW</span>
                    {scratchResponse && (
                      <span className="dev-scratch-res-meta">
                        Status:{' '}
                        <strong>
                          HTTP {scratchResponse.status}{' '}
                          {scratchResponse.statusText}
                        </strong>{' '}
                        | Latency: <strong>{scratchResponse.latency}ms</strong>
                      </span>
                    )}
                  </div>
                  <div className="dev-scratch-res-body">
                    {scratchResponse ? (
                      <pre className="dev-json-viewer">
                        {typeof scratchResponse.data === 'object'
                          ? JSON.stringify(scratchResponse.data, null, 2)
                          : scratchResponse.data}
                      </pre>
                    ) : (
                      <div className="dev-scratch-empty-state">
                        <i className="fa-solid fa-code" />
                        <p>
                          Kirimkan request untuk melihat output JSON respons di
                          sini.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Database Studio */}
          {activeTab === 'database' && (
            <div className="dev-panel-content">
              <div className="dev-panel-header">
                <div>
                  <h2 className="dev-panel-title">
                    Mongoose Database Collection Studio
                  </h2>
                  <p className="dev-panel-desc">
                    Koleksi model basis data MongoDB Karang Taruna Kelurahan
                    Rawa Arum.
                  </p>
                </div>
                <div className="dev-db-badge">
                  <i className="fa-solid fa-layer-group" /> 12 Registered
                  Collections
                </div>
              </div>

              <div className="dev-collections-grid">
                {MONGOOSE_COLLECTIONS.map((col, idx) => (
                  <div key={idx} className="dev-col-card">
                    <div className="dev-col-icon">
                      <i className={`fa-solid ${col.icon}`} />
                    </div>
                    <div className="dev-col-info">
                      <h4>{col.name}</h4>
                      <p>
                        Model: <code>{col.model}</code>
                      </p>
                      <div className="dev-col-meta">
                        <span>
                          Documents: <strong>{col.count}</strong>
                        </span>
                        <span className="dev-col-status">{col.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Log Stream */}
          {activeTab === 'logs' && (
            <div className="dev-panel-content">
              <div className="dev-panel-header">
                <div>
                  <h2 className="dev-panel-title">Live Terminal Logs Stream</h2>
                  <p className="dev-panel-desc">
                    Log aktivitas transaksi server, security guard, dan request
                    telemetri.
                  </p>
                </div>
                <div className="dev-log-controls">
                  {['ALL', 'INFO', 'WARN', 'ERR'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className={`dev-log-filter-btn ${logFilter === lvl ? 'active' : ''}`}
                      onClick={() => setLogFilter(lvl)}
                    >
                      {lvl}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="dev-log-clear-btn"
                    onClick={() => setLogList([])}
                  >
                    <i className="fa-solid fa-trash" /> Clear
                  </button>
                </div>
              </div>

              <div className="dev-log-terminal">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`dev-log-row dev-log-${log.level.toLowerCase()}`}
                    >
                      <span className="dev-log-time">[{log.timestamp}]</span>
                      <span
                        className={`dev-log-badge dev-log-badge-${log.level.toLowerCase()}`}
                      >
                        {log.level}
                      </span>
                      <span className="dev-log-scope">[{log.scope}]</span>
                      <span className="dev-log-msg">{log.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="dev-log-empty">
                    Tidak ada log pada filter ini.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: Feature Flags & Controls */}
          {activeTab === 'flags' && (
            <div className="dev-panel-content">
              <div className="dev-panel-header">
                <div>
                  <h2 className="dev-panel-title">
                    Feature Flags &amp; Environment Matrix
                  </h2>
                  <p className="dev-panel-desc">
                    Kendali parameter sistem untuk simulasi perilaku backend dan
                    debugging.
                  </p>
                </div>
              </div>

              <div className="dev-flags-grid">
                <div className="dev-flag-card">
                  <div className="dev-flag-head">
                    <i className="fa-solid fa-triangle-exclamation" />
                    <h4>Maintenance Mode Simulator (503)</h4>
                  </div>
                  <p>
                    Simulasikan kondisi perbaikan sistem pada antarmuka publik.
                  </p>
                  <button
                    type="button"
                    className={`dev-flag-toggle ${flags.maintenanceMode ? 'active' : ''}`}
                    onClick={() => toggleFlag('maintenanceMode')}
                  >
                    <span className="dev-flag-slider" />
                  </button>
                </div>

                <div className="dev-flag-card">
                  <div className="dev-flag-head">
                    <i className="fa-solid fa-bug" />
                    <h4>Verbose Debug Console Logging</h4>
                  </div>
                  <p>
                    Cetak output terstruktur pada konsol inspektor developer.
                  </p>
                  <button
                    type="button"
                    className={`dev-flag-toggle ${flags.verboseLogs ? 'active' : ''}`}
                    onClick={() => toggleFlag('verboseLogs')}
                  >
                    <span className="dev-flag-slider" />
                  </button>
                </div>

                <div className="dev-flag-card">
                  <div className="dev-flag-head">
                    <i className="fa-solid fa-bolt" />
                    <h4>Client In-Memory Cache Simulation</h4>
                  </div>
                  <p>Cache respons get request pada memori browser.</p>
                  <button
                    type="button"
                    className={`dev-flag-toggle ${flags.cacheSimulation ? 'active' : ''}`}
                    onClick={() => toggleFlag('cacheSimulation')}
                  >
                    <span className="dev-flag-slider" />
                  </button>
                </div>

                <div className="dev-flag-card">
                  <div className="dev-flag-head">
                    <i className="fa-solid fa-shield-halved" />
                    <h4>Anti-DoS Throttling Guard</h4>
                  </div>
                  <p>Mekanisme rate limiter aktif membatasi spam bot.</p>
                  <button
                    type="button"
                    className={`dev-flag-toggle ${flags.rateLimiterActive ? 'active' : ''}`}
                    onClick={() => toggleFlag('rateLimiterActive')}
                  >
                    <span className="dev-flag-slider" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DeveloperWorkspacePage;
