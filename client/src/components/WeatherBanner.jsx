import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWeatherRawaArum } from '../services/api';
import { MOCK_WEATHER_DATA } from '../constants/mockData';

const WeatherBanner = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await fetchWeatherRawaArum();
      if (data) {
        setWeather(data);
      } else {
        setWeather(MOCK_WEATHER_DATA);
      }
    } catch (_err) {
      setWeather(MOCK_WEATHER_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh real-time data silently every 3 minutes (180,000 ms)
    const interval = setInterval(() => {
      loadData();
    }, 180000);

    return () => clearInterval(interval);
  }, []);

  const displayData = weather || MOCK_WEATHER_DATA;

  // Calculate dynamic sky theme key based on real-time hour & weather code
  const currentHour = new Date().getHours();
  const code = displayData.weatherCode || 0;

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

  // Select main condition icon based on real-time weather & hour
  const getWeatherMainIcon = () => {
    if (code >= 80) return 'fa-solid fa-cloud-showers-heavy';
    if (code >= 51) return 'fa-solid fa-cloud-rain';
    if (code >= 45) return 'fa-solid fa-smog';
    if (isNight) {
      return code >= 1 ? 'fa-solid fa-cloud-moon' : 'fa-solid fa-moon';
    }
    if (currentHour >= 15 && currentHour < 18.5) {
      return 'fa-solid fa-sun-plant-wilt';
    }
    return code >= 1 ? 'fa-solid fa-cloud-sun' : 'fa-solid fa-sun';
  };

  // Select icon for tomorrow's forecast dynamically based on realtime WMO weather code
  const getTomorrowMainIcon = () => {
    const tCode = displayData.tomorrowForecast?.weatherCode ?? 0;
    if (tCode >= 95) return 'fa-solid fa-cloud-bolt';
    if (tCode >= 80) return 'fa-solid fa-cloud-showers-heavy';
    if (tCode >= 51) return 'fa-solid fa-cloud-rain';
    if (tCode >= 45) return 'fa-solid fa-smog';
    if (tCode === 3) return 'fa-solid fa-cloud';
    if (tCode === 1 || tCode === 2) return 'fa-solid fa-cloud-sun';
    if (tCode === 0) return 'fa-solid fa-sun';
    return 'fa-solid fa-cloud-sun';
  };

  if (loading && !weather) {
    return (
      <section className="weather-section weather-section--skeleton">
        <div className="container">
          <div className="weather-skeleton-line"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="weather-section">
      {/* Ultra-Lightweight GPU Hardware Accelerated Background Layers */}
      <div
        className={`weather-bg-layer weather-theme--morning ${
          activeThemeKey === 'morning' ? 'is-active' : ''
        }`}
      />
      <div
        className={`weather-bg-layer weather-theme--day ${
          activeThemeKey === 'day' ? 'is-active' : ''
        }`}
      />
      <div
        className={`weather-bg-layer weather-theme--sunset ${
          activeThemeKey === 'sunset' ? 'is-active' : ''
        }`}
      />
      <div
        className={`weather-bg-layer weather-theme--night ${
          activeThemeKey === 'night' ? 'is-active' : ''
        }`}
      />
      <div
        className={`weather-bg-layer weather-theme--rain ${
          activeThemeKey === 'rain' ? 'is-active' : ''
        }`}
      />

      <div className="container">
        <div className="weather-section-content">
          {/* Top Header Row inside Section */}
          <div className="weather-card-header">
            <div className="weather-location-badge">
              <i className="fa-solid fa-cloud-sun weather-icon-pin"></i>
              <span className="weather-location-title">
                METEOROLOGI & CUACA TERKINI
              </span>
              <span className="weather-location-text">
                — {displayData.location || 'Kelurahan Rawa Arum, Cilegon'}
              </span>
            </div>

            {/* Top Right Header Action: Small "Selengkapnya ->" Link */}
            <div className="weather-header-actions">
              <Link
                to="/cuaca"
                className="weather-more-link"
                title="Lihat detail prediksi cuaca"
              >
                <span className="weather-more-text">Selengkapnya</span>
                <i className="fa-solid fa-arrow-right weather-btn-arrow"></i>
              </Link>
            </div>
          </div>

          {/* Section Body: Main Display & Detailed Indicators Grid */}
          <div className="weather-card-body">
            {/* Left Column: Temperature & Main Icon */}
            <div className="weather-left-display">
              <div className="weather-main-icon-box">
                <i
                  key={getWeatherMainIcon()}
                  className={`${getWeatherMainIcon()} weather-main-icon weather-fade-in`}
                ></i>
              </div>

              <div className="weather-temp-group">
                <div className="weather-temp-value">
                  {displayData.temperature}
                  <span className="weather-temp-unit">°C</span>
                </div>
                <div className="weather-condition-desc">
                  <span className="weather-condition-title">
                    {displayData.conditionText}
                  </span>
                  <span className="weather-feels-like">
                    Sensasi {displayData.feelsLike}°C
                  </span>
                </div>
              </div>
            </div>

            {/* Vertical Separator */}
            <div className="weather-divider"></div>

            {/* Right Column: Detailed Meteorological Indicators */}
            <div className="weather-indicators-grid">
              {/* Kecepatan Angin */}
              <div className="weather-indicator-item" title="Kecepatan Angin">
                <div className="weather-indicator-icon">
                  <i className="fa-solid fa-wind"></i>
                </div>
                <div className="weather-indicator-content">
                  <span className="weather-indicator-label">
                    Kecepatan Angin
                  </span>
                  <span className="weather-indicator-value">
                    {displayData.windSpeed} <small>km/jam</small>
                  </span>
                </div>
              </div>

              {/* Arah Angin */}
              <div
                className="weather-indicator-item"
                title="Arah Angin & Kompas"
              >
                <div className="weather-indicator-icon">
                  <i
                    className="fa-solid fa-compass"
                    style={{
                      transform: `rotate(${displayData.windDegree || 0}deg)`,
                      transition: 'transform 0.5s ease',
                    }}
                  ></i>
                </div>
                <div className="weather-indicator-content">
                  <span className="weather-indicator-label">Arah Angin</span>
                  <span className="weather-indicator-value">
                    {displayData.windDirection}
                  </span>
                </div>
              </div>

              {/* Kelembapan Udara */}
              <div className="weather-indicator-item" title="Kelembapan Udara">
                <div className="weather-indicator-icon">
                  <i className="fa-solid fa-droplet"></i>
                </div>
                <div className="weather-indicator-content">
                  <span className="weather-indicator-label">Kelembapan</span>
                  <span className="weather-indicator-value">
                    {displayData.humidity}%
                  </span>
                </div>
              </div>

              {/* Intensitas Cahaya / Lux */}
              <div
                className="weather-indicator-item"
                title="Intensitas Cahaya (Solar Irradiance)"
              >
                <div className="weather-indicator-icon">
                  <i className="fa-solid fa-lightbulb"></i>
                </div>
                <div className="weather-indicator-content">
                  <span className="weather-indicator-label">Cahaya (Lux)</span>
                  <span className="weather-indicator-value">
                    {displayData.lux
                      ? displayData.lux.toLocaleString('id-ID')
                      : '35.000'}{' '}
                    <small>lx</small>
                  </span>
                </div>
              </div>

              {/* Tekanan Udara & Index UV */}
              <div
                className="weather-indicator-item"
                title="Tekanan Udara & Radiasi UV"
              >
                <div className="weather-indicator-icon">
                  <i className="fa-solid fa-gauge-high"></i>
                </div>
                <div className="weather-indicator-content">
                  <span className="weather-indicator-label">Tekanan & UV</span>
                  <span className="weather-indicator-value">
                    {displayData.pressure} hPa | UV {displayData.uvIndex}
                  </span>
                </div>
              </div>

              {/* Prediksi Cuaca Besok */}
              <div
                className="weather-indicator-item weather-tomorrow-item"
                title={`Prakiraan Besok: ${displayData.tomorrowForecast?.conditionText || 'Cerah Berawan'} (${displayData.tomorrowForecast?.tempMax || 31}°C / ${displayData.tomorrowForecast?.tempMin || 24}°C)`}
              >
                <div className="weather-indicator-icon">
                  <i className={getTomorrowMainIcon()}></i>
                </div>
                <div className="weather-indicator-content">
                  <span className="weather-indicator-label">
                    Besok:{' '}
                    {displayData.tomorrowForecast?.conditionText ||
                      'Cerah Berawan'}
                  </span>
                  <span className="weather-indicator-value">
                    {displayData.tomorrowForecast?.tempMax || 31}°{' '}
                    <small>
                      / {displayData.tomorrowForecast?.tempMin || 24}°C
                    </small>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeatherBanner;
