import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchDetailedWeatherRawaArum,
  fetchWeatherHistory,
} from '../services/api';

const CuacaPage = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [activeTab, setActiveTab] = useState('temp');
  const [rangeMode, setRangeMode] = useState('day'); // 'day', 'week', 'month'
  const [periodOffset, setPeriodOffset] = useState(0); // 0 = current, 1 = 1 ago...
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const loadWeather = async () => {
    try {
      const data = await fetchDetailedWeatherRawaArum();
      setWeatherData(data);
    } catch (_err) {
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const history = await fetchWeatherHistory(rangeMode, periodOffset);
      setHistoryData(history || []);
    } catch (_err) {
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Meteorologi & Prediksi Cuaca — Karang Taruna Rawa Arum';
    loadWeather();

    const dataInterval = setInterval(loadWeather, 180000);
    return () => clearInterval(dataInterval);
  }, []);

  // Fetch history when rangeMode or periodOffset changes
  useEffect(() => {
    loadHistory();
  }, [rangeMode, periodOffset]);

  // Realtime Clock Ticker
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };

    updateClock();
    const clockInterval = setInterval(updateClock, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const data = weatherData;

  if (loading || !data) {
    return (
      <div className="cuaca-page-wrapper">
        <div className="container">
          <div
            className="cuaca-skeleton-compact"
            style={{ marginTop: '100px', minHeight: '400px' }}
          ></div>
        </div>
      </div>
    );
  }

  // Sky Theme
  const currentHour = new Date().getHours();
  const code = data.weatherCode || 0;

  let activeThemeKey = 'day';
  let isNight = false;

  if (code >= 51 && code <= 95) {
    activeThemeKey = 'rain';
  } else if (currentHour >= 5 && currentHour < 9) {
    activeThemeKey = 'morning';
  } else if (currentHour >= 9 && currentHour < 15) {
    activeThemeKey = 'day';
  } else if (currentHour >= 15 && currentHour < 18.5) {
    activeThemeKey = 'sunset';
  } else {
    activeThemeKey = 'night';
    isNight = true;
  }

  // Weather Icon Helper
  const getWeatherIconClass = (wCode, isNightTime = false) => {
    if (wCode >= 95) return 'fa-solid fa-cloud-bolt';
    if (wCode >= 80) return 'fa-solid fa-cloud-showers-heavy';
    if (wCode >= 51) return 'fa-solid fa-cloud-rain';
    if (wCode >= 45) return 'fa-solid fa-smog';
    if (wCode === 3) return 'fa-solid fa-cloud';
    if (isNightTime) {
      return wCode >= 1 ? 'fa-solid fa-cloud-moon' : 'fa-solid fa-moon';
    }
    return wCode >= 1 ? 'fa-solid fa-cloud-sun' : 'fa-solid fa-sun';
  };

  // Helper for Chart Metric Extractor
  const getMetricDetails = (tabKey) => {
    switch (tabKey) {
      case 'temp':
        return {
          label: 'Suhu (°C)',
          unit: '°C',
          getValue: (item) => item.temperature,
          color: '#f97316',
          gradientId: 'tempGrad',
          icon: 'fa-temperature-high',
        };
      case 'humidity':
        return {
          label: 'Kelembapan (%)',
          unit: '%',
          getValue: (item) => item.humidity,
          color: '#0284c7',
          gradientId: 'humidityGrad',
          icon: 'fa-droplet',
        };
      case 'wind':
        return {
          label: 'Kecepatan Angin (km/h)',
          unit: ' km/h',
          getValue: (item) => item.windSpeed,
          color: '#10b981',
          gradientId: 'windGrad',
          icon: 'fa-wind',
        };
      case 'uv':
        return {
          label: 'Indeks UV',
          unit: '',
          getValue: (item) => item.uvIndex,
          color: '#eab308',
          gradientId: 'uvGrad',
          icon: 'fa-sun',
        };
      case 'aqi':
        return {
          label: 'Kualitas Udara (AQI)',
          unit: ' AQI',
          getValue: (item) => item.aqi || 28,
          color: '#8b5cf6',
          gradientId: 'aqiGrad',
          icon: 'fa-leaf',
        };
      case 'pressure':
        return {
          label: 'Tekanan Udara (hPa)',
          unit: ' hPa',
          getValue: (item) => item.pressure || 1012,
          color: '#64748b',
          gradientId: 'pressureGrad',
          icon: 'fa-gauge',
        };
      default:
        return {
          label: 'Suhu (°C)',
          unit: '°C',
          getValue: (item) => item.temperature,
          color: '#f97316',
          gradientId: 'tempGrad',
          icon: 'fa-temperature-high',
        };
    }
  };

  const metricInfo = getMetricDetails(activeTab);

  // Period Label Generator
  const getPeriodDisplayLabel = () => {
    if (rangeMode === 'day') {
      if (periodOffset === 0) return 'Hari Ini';
      if (periodOffset === 1) return '1 Hari Lalu';
      return `${periodOffset} Hari Lalu`;
    }
    if (rangeMode === 'week') {
      if (periodOffset === 0) return 'Minggu Ini (7 Hari)';
      if (periodOffset === 1) return '1 Minggu Lalu';
      return `${periodOffset} Minggu Lalu`;
    }
    if (rangeMode === 'month') {
      if (periodOffset === 0) return 'Bulan Ini (30 Hari)';
      if (periodOffset === 1) return '1 Bulan Lalu';
      return `${periodOffset} Bulan Lalu`;
    }
    return 'Hari Ini';
  };

  // Calculate SVG Line Chart Points
  const historyList = historyData;

  const values = historyList.map(metricInfo.getValue);
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 0;
  const valRange = maxVal - minVal;
  const avgVal =
    values.length > 0
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) /
        10
      : 0;
  const lastVal = values.length > 0 ? values[values.length - 1] : 0;

  const svgWidth = 720;
  const svgHeight = 200;
  const paddingX = 30;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const points = historyList.map((item, index) => {
    const val = metricInfo.getValue(item);
    const x =
      historyList.length === 1
        ? svgWidth / 2
        : paddingX + (index / (historyList.length - 1)) * chartWidth;
    const normY = valRange === 0 ? 0.5 : (val - minVal) / valRange;
    const y = svgHeight - paddingY - normY * chartHeight;

    const pDate = new Date(item.timestamp);
    let timeLabel = pDate.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    if (rangeMode === 'week') {
      timeLabel = `${pDate.toLocaleDateString('id-ID', { weekday: 'short' })} ${pDate.getDate()}/${pDate.getMonth() + 1}`;
    } else if (rangeMode === 'month') {
      timeLabel = `${pDate.getDate()}/${pDate.getMonth() + 1}`;
    }

    return { x, y, val, timeLabel, item };
  });

  const pathD =
    points.length > 0
      ? points.reduce(
          (acc, p, i) =>
            i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`,
          ''
        )
      : '';

  const polygonD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
      : '';

  return (
    <div className="cuaca-page-wrapper">
      <div className="container">
        {/* Sleek Balanced Banner Card */}
        <div
          className={`cuaca-hero-banner-card cuaca-banner-theme--${activeThemeKey}`}
        >
          <div className="banner-row-primary">
            <div className="banner-title-group">
              <div className="banner-breadcrumbs">
                <Link to="/">Beranda</Link>
                <i className="fa-solid fa-chevron-right"></i>
                <span>Prakiraan Cuaca</span>
              </div>
              <h1 className="banner-heading">Meteorologi & Prediksi Cuaca</h1>
              <div className="banner-sub-location">
                <i className="fa-solid fa-location-dot"></i>
                <span>
                  {data.location} — {data.district || 'Grogol, Cilegon'}
                </span>
              </div>
            </div>

            <div className="banner-hero-temp-badge">
              <div className="clock-live-pill">
                <i className="fa-regular fa-clock"></i>
                <span>{currentTime || '09:00:00'} WIB</span>
              </div>

              <div className="main-temp-display">
                <div className="temp-icon-box">
                  <i
                    className={getWeatherIconClass(data.weatherCode, isNight)}
                  ></i>
                </div>
                <div className="temp-numbers">
                  <span className="val">{data.temperature}°C</span>
                  <div className="text-group">
                    <span className="cond">{data.conditionText}</span>
                    <span className="feels">Terasa {data.feelsLike}°C</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="banner-metrics-grid">
            <div className="metric-box">
              <div className="m-icon">
                <i className="fa-solid fa-wind"></i>
              </div>
              <div className="m-text">
                <span className="m-label">Angin</span>
                <span className="m-val">
                  {data.windSpeed} km/h <small>({data.windDirection})</small>
                </span>
              </div>
            </div>

            <div className="metric-box">
              <div className="m-icon">
                <i className="fa-solid fa-droplet"></i>
              </div>
              <div className="m-text">
                <span className="m-label">Kelembapan</span>
                <span className="m-val">
                  {data.humidity}% <small>(Embun {data.dewPoint}°C)</small>
                </span>
              </div>
            </div>

            <div className="metric-box">
              <div className="m-icon">
                <i className="fa-solid fa-sun"></i>
              </div>
              <div className="m-text">
                <span className="m-label">Indeks Radiasi UV</span>
                <span className="m-val">
                  UV {data.uvIndex} <small>(Sedang)</small>
                </span>
              </div>
            </div>

            <div className="metric-box">
              <div className="m-icon">
                <i className="fa-solid fa-leaf"></i>
              </div>
              <div className="m-text">
                <span className="m-label">Kualitas Udara</span>
                <span className="m-val">{data.airQuality}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Dashboard Grid */}
        {loading ? (
          <div className="cuaca-skeleton-compact"></div>
        ) : (
          <div className="cuaca-one-screen-grid">
            {/* Column 1: 8 Parameters, Advisory & Historical Chart */}
            <div className="cuaca-col-params">
              <div className="cuaca-card-box">
                <div className="card-box-header">
                  <i className="fa-solid fa-gauge-high"></i>
                  <h3>Parameter Meteorologi Detail</h3>
                </div>
                <div className="cuaca-grid-8-tiles">
                  <div className="param-mini-tile">
                    <div className="tile-icon">
                      <i className="fa-solid fa-wind"></i>
                    </div>
                    <div className="tile-info">
                      <span className="t-label">Angin & Kompas</span>
                      <span className="t-val">
                        {data.windSpeed} km/h{' '}
                        <small>({data.windDirection})</small>
                      </span>
                    </div>
                  </div>

                  <div className="param-mini-tile">
                    <div className="tile-icon">
                      <i className="fa-solid fa-droplet"></i>
                    </div>
                    <div className="tile-info">
                      <span className="t-label">Kelembapan</span>
                      <span className="t-val">
                        {data.humidity}%{' '}
                        <small>(Embun {data.dewPoint}°C)</small>
                      </span>
                    </div>
                  </div>

                  <div className="param-mini-tile">
                    <div className="tile-icon">
                      <i className="fa-solid fa-lightbulb"></i>
                    </div>
                    <div className="tile-info">
                      <span className="t-label">Intensitas Cahaya</span>
                      <span className="t-val">
                        {data.lux ? data.lux.toLocaleString('id-ID') : '48.000'}{' '}
                        lx
                      </span>
                    </div>
                  </div>

                  <div className="param-mini-tile">
                    <div className="tile-icon">
                      <i className="fa-solid fa-sun"></i>
                    </div>
                    <div className="tile-info">
                      <span className="t-label">Indeks Radiasi UV</span>
                      <span className="t-val">
                        UV {data.uvIndex} <small>(Sedang)</small>
                      </span>
                    </div>
                  </div>

                  <div className="param-mini-tile">
                    <div className="tile-icon">
                      <i className="fa-solid fa-gauge"></i>
                    </div>
                    <div className="tile-info">
                      <span className="t-label">Tekanan Udara</span>
                      <span className="t-val">
                        {data.pressure} hPa <small>(Normal)</small>
                      </span>
                    </div>
                  </div>

                  <div className="param-mini-tile">
                    <div className="tile-icon">
                      <i className="fa-solid fa-leaf"></i>
                    </div>
                    <div className="tile-info">
                      <span className="t-label">Kualitas Udara</span>
                      <span className="t-val">{data.airQuality}</span>
                    </div>
                  </div>

                  <div className="param-mini-tile">
                    <div className="tile-icon">
                      <i className="fa-solid fa-eye"></i>
                    </div>
                    <div className="tile-info">
                      <span className="t-label">Jarak Pandang</span>
                      <span className="t-val">
                        {data.visibility || '10 km (Jernih)'}
                      </span>
                    </div>
                  </div>

                  <div className="param-mini-tile">
                    <div className="tile-icon">
                      <i className="fa-solid fa-sun-plant-wilt"></i>
                    </div>
                    <div className="tile-info">
                      <span className="t-label">Siklus Matahari</span>
                      <span className="t-val">
                        🌅 {data.sunrise || '05:58'} | 🌇{' '}
                        {data.sunset || '18:02'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cuaca-card-box cuaca-advisory-box">
                <div className="card-box-header">
                  <i className="fa-solid fa-shield-halved"></i>
                  <h3>Himbauan Cuaca Rawa Arum</h3>
                </div>
                <div className="advisory-bullets">
                  <div className="adv-bullet">
                    <i className="fa-solid fa-circle-check"></i>
                    <span>
                      <strong>Pesisir & Nelayan:</strong> Kecepatan angin 14
                      km/h aman untuk aktivitas pesisir Merak-Cilegon.
                    </span>
                  </div>
                  <div className="adv-bullet">
                    <i className="fa-solid fa-circle-check"></i>
                    <span>
                      <strong>Suhu Maksimum:</strong> Est. 32°C siang hari,
                      pastikan konsumsi air secukupnya.
                    </span>
                  </div>
                </div>
              </div>

              {/* NEW: Interactive Weather History Chart Card with Time Range Controls & Period Pager */}
              <div className="cuaca-card-box cuaca-history-chart-card">
                <div className="history-chart-header">
                  <div className="h-header-title">
                    <i className="fa-solid fa-chart-line"></i>
                    <div>
                      <h3>Grafik Tren Historis Meteorologi Rawa Arum</h3>
                      <span className="h-sub">
                        Perekaman otomatis setiap 30 menit
                      </span>
                    </div>
                  </div>

                  {/* Parameter Selection Tabs */}
                  <div className="history-tabs-nav">
                    <button
                      className={`h-tab-btn ${activeTab === 'temp' ? 'active' : ''}`}
                      onClick={() => setActiveTab('temp')}
                    >
                      <i className="fa-solid fa-temperature-high"></i> Suhu
                    </button>
                    <button
                      className={`h-tab-btn ${activeTab === 'humidity' ? 'active' : ''}`}
                      onClick={() => setActiveTab('humidity')}
                    >
                      <i className="fa-solid fa-droplet"></i> Kelembapan
                    </button>
                    <button
                      className={`h-tab-btn ${activeTab === 'wind' ? 'active' : ''}`}
                      onClick={() => setActiveTab('wind')}
                    >
                      <i className="fa-solid fa-wind"></i> Angin
                    </button>
                    <button
                      className={`h-tab-btn ${activeTab === 'uv' ? 'active' : ''}`}
                      onClick={() => setActiveTab('uv')}
                    >
                      <i className="fa-solid fa-sun"></i> UV
                    </button>
                    <button
                      className={`h-tab-btn ${activeTab === 'aqi' ? 'active' : ''}`}
                      onClick={() => setActiveTab('aqi')}
                    >
                      <i className="fa-solid fa-leaf"></i> AQI
                    </button>
                    <button
                      className={`h-tab-btn ${activeTab === 'pressure' ? 'active' : ''}`}
                      onClick={() => setActiveTab('pressure')}
                    >
                      <i className="fa-solid fa-gauge"></i> Tekanan
                    </button>
                  </div>
                </div>

                {/* Summary Stat Chips & Range Controls Inline Row */}
                <div className="chart-stats-row">
                  <div className="stats-chips-left">
                    <div className="c-stat-chip">
                      <span className="c-stat-label">Terakhir</span>
                      <span
                        className="c-stat-val"
                        style={{ color: metricInfo.color }}
                      >
                        {historyList.length > 0
                          ? `${lastVal}${metricInfo.unit}`
                          : '-'}
                      </span>
                    </div>
                    <div className="c-stat-chip">
                      <span className="c-stat-label">Tertinggi</span>
                      <span className="c-stat-val">
                        {historyList.length > 0
                          ? `${maxVal}${metricInfo.unit}`
                          : '-'}
                      </span>
                    </div>
                    <div className="c-stat-chip">
                      <span className="c-stat-label">Terendah</span>
                      <span className="c-stat-val">
                        {historyList.length > 0
                          ? `${minVal}${metricInfo.unit}`
                          : '-'}
                      </span>
                    </div>
                    <div className="c-stat-chip">
                      <span className="c-stat-label">Rata-Rata</span>
                      <span className="c-stat-val">
                        {historyList.length > 0
                          ? `${avgVal}${metricInfo.unit}`
                          : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Range Mode & Period Controls Inline Right */}
                  <div className="history-controls-row">
                    <div className="range-pills-group">
                      <button
                        className={`range-pill-btn ${rangeMode === 'day' ? 'active' : ''}`}
                        onClick={() => {
                          setRangeMode('day');
                          setPeriodOffset(0);
                        }}
                      >
                        1 Hari
                      </button>
                      <button
                        className={`range-pill-btn ${rangeMode === 'week' ? 'active' : ''}`}
                        onClick={() => {
                          setRangeMode('week');
                          setPeriodOffset(0);
                        }}
                      >
                        Seminggu
                      </button>
                      <button
                        className={`range-pill-btn ${rangeMode === 'month' ? 'active' : ''}`}
                        onClick={() => {
                          setRangeMode('month');
                          setPeriodOffset(0);
                        }}
                      >
                        Sebulan
                      </button>
                    </div>

                    <div className="period-pager-group">
                      <button
                        className="pager-btn"
                        onClick={() => setPeriodOffset(periodOffset + 1)}
                        title="Periode Sebelumnya"
                      >
                        <i className="fa-solid fa-chevron-left"></i>
                      </button>
                      <span className="pager-label">
                        {getPeriodDisplayLabel()}
                      </span>
                      <button
                        className="pager-btn"
                        onClick={() =>
                          setPeriodOffset(Math.max(0, periodOffset - 1))
                        }
                        disabled={periodOffset === 0}
                        title="Periode Berikutnya"
                      >
                        <i className="fa-solid fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive SVG Line Chart / Empty State */}
                <div className="svg-chart-container">
                  {historyLoading ? (
                    <div className="chart-empty-state">
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                      <span>Memuat data historis...</span>
                    </div>
                  ) : historyList.length === 0 ? (
                    <div className="chart-empty-state">
                      <i className="fa-solid fa-chart-area"></i>
                      <h4>Belum Ada Catatan Sensor Pada Periode Ini</h4>
                      <p>
                        Himpunan data aktual dari sensor meteorologi sedang
                        disimpan otomatis secara periodik.
                      </p>
                    </div>
                  ) : (
                    <>
                      <svg
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        className="svg-chart-element"
                      >
                        <defs>
                          <linearGradient
                            id={metricInfo.gradientId}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={metricInfo.color}
                              stopOpacity="0.35"
                            />
                            <stop
                              offset="100%"
                              stopColor={metricInfo.color}
                              stopOpacity="0.0"
                            />
                          </linearGradient>
                        </defs>

                        {/* Background Grid Lines */}
                        <line
                          x1={paddingX}
                          y1={paddingY}
                          x2={svgWidth - paddingX}
                          y2={paddingY}
                          stroke="#f1f5f9"
                          strokeDasharray="3 3"
                        />
                        <line
                          x1={paddingX}
                          y1={svgHeight / 2}
                          x2={svgWidth - paddingX}
                          y2={svgHeight / 2}
                          stroke="#f1f5f9"
                          strokeDasharray="3 3"
                        />
                        <line
                          x1={paddingX}
                          y1={svgHeight - paddingY}
                          x2={svgWidth - paddingX}
                          y2={svgHeight - paddingY}
                          stroke="#e2e8f0"
                        />

                        {/* Gradient Area Fill */}
                        {points.length > 1 && (
                          <polygon
                            points={polygonD.replace(/[MLZ]/g, '').trim()}
                            fill={`url(#${metricInfo.gradientId})`}
                          />
                        )}

                        {/* Smooth Line Path */}
                        {points.length > 1 && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke={metricInfo.color}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}

                        {/* Interactive Data Points */}
                        {points.map((p, idx) => (
                          <g
                            key={idx}
                            onMouseEnter={() => setHoveredPoint(p)}
                            onMouseLeave={() => setHoveredPoint(null)}
                          >
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r={hoveredPoint?.x === p.x ? '6' : '3.5'}
                              fill="#ffffff"
                              stroke={metricInfo.color}
                              strokeWidth="2.5"
                              style={{
                                transition: 'all 0.15s ease',
                                cursor: 'pointer',
                              }}
                            />
                          </g>
                        ))}
                      </svg>

                      {/* Active Point Tooltip */}
                      {hoveredPoint && (
                        <div
                          className="chart-hover-tooltip"
                          style={{
                            left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                            top: `${(hoveredPoint.y / svgHeight) * 100 - 38}%`,
                          }}
                        >
                          <span className="tt-time">
                            {hoveredPoint.timeLabel}
                          </span>
                          <span
                            className="tt-val"
                            style={{ color: metricInfo.color }}
                          >
                            {hoveredPoint.val}
                            {metricInfo.unit}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Bottom Time Labels */}
                {points.length > 0 && (
                  <div className="chart-time-labels">
                    {points
                      .filter(
                        (_, i) =>
                          i % Math.max(1, Math.ceil(points.length / 6)) === 0
                      )
                      .map((p, i) => (
                        <span key={i}>{p.timeLabel}</span>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Right Sidebar (7-Day Forecast & 24-Hour Hourly Ticker) */}
            <div className="cuaca-col-right-sidebar">
              {/* Card 1: 7-Day Daily Forecast */}
              <div className="cuaca-col-weekly cuaca-card-box">
                <div className="card-box-header">
                  <i className="fa-solid fa-calendar-week"></i>
                  <h3>Prakiraan 7 Hari</h3>
                </div>
                <div className="cuaca-weekly-vertical">
                  {data.dailyForecast?.map((day, idx) => (
                    <div key={idx} className="weekly-mini-row">
                      <div className="w-day-info">
                        <span className="w-name">{day.dayLabel}</span>
                        <span className="w-date">{day.dateFormatted}</span>
                      </div>
                      <div className="w-cond">
                        <i className={getWeatherIconClass(day.weatherCode)}></i>
                        <span className="w-cond-name">{day.conditionText}</span>
                      </div>
                      <div className="w-temps">
                        <span className="w-h">{day.tempMax}°</span>
                        <span className="w-l">{day.tempMin}°C</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cuaca-source-notice">
                  <i className="fa-solid fa-circle-info"></i>
                  <span>Open-Meteo & BMKG Rawa Arum (-5.9922, 106.0125)</span>
                </div>
              </div>

              {/* Card 2: 24-Hour Hourly Forecast Ticker */}
              <div className="cuaca-card-box cuaca-col-hourly-card">
                <div className="card-box-header">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                  <h3>Prakiraan 24 Jam Ke Depan</h3>
                </div>
                <div className="cuaca-vertical-ticker">
                  {data.hourlyForecast?.map((item, idx) => (
                    <div key={idx} className="ticker-row">
                      <span className="t-time">{item.time}</span>
                      <i
                        className={`${getWeatherIconClass(item.weatherCode)} t-icon`}
                      ></i>
                      <span className="t-temp">{item.temp}°C</span>
                      <span className="t-pop">
                        <i className="fa-solid fa-droplet"></i> {item.pop}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CuacaPage;
