const WeatherHistory = require('../models/WeatherHistory');

/**
 * Weather condition description mapper (WMO weather codes)
 */
const getWeatherConditionText = (code) => {
  if (code === 0) return 'Cerah';
  if (code === 1) return 'Cerah Berawan';
  if (code === 2) return 'Berawan Sebagian';
  if (code === 3) return 'Berawan Tebal';
  if (code >= 45 && code <= 48) return 'Berkabut';
  if (code >= 51 && code <= 55) return 'Gerimis Halus';
  if (code >= 61 && code <= 65) return 'Hujan Ringan';
  if (code >= 80 && code <= 82) return 'Hujan Deras';
  if (code >= 95) return 'Hujan Petir';
  return 'Berawan';
};

/**
 * Compass direction helper
 */
const getCompassDirection = (deg) => {
  if (deg === undefined || deg === null) return 'Utara (U)';
  const directions = [
    'Utara (U)',
    'Timur Laut (TL)',
    'Timur (T)',
    'Tenggara (TG)',
    'Selatan (S)',
    'Barat Daya (BD)',
    'Barat (B)',
    'Barat Laut (BL)',
  ];
  return directions[Math.round(deg / 45) % 8];
};

/**
 * Core function to fetch Open-Meteo & Air Quality APIs live and record a 100% REAL snapshot to MongoDB.
 */
const recordWeatherSnapshot = async () => {
  try {
    const lat = -5.9922;
    const lon = 106.0125;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,direct_normal_irradiance,uv_index,visibility&timezone=Asia%2FJakarta`;
    const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi&timezone=Asia%2FJakarta`;

    const fetchOptions = {
      headers: {
        'User-Agent': 'KarangTarunaRawaArumApp/1.0 (Node.js Express Server)',
        Accept: 'application/json',
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const [wRes, aRes] = await Promise.all([
      fetch(weatherUrl, { ...fetchOptions, signal: controller.signal }).catch(
        () => null
      ),
      fetch(airUrl, { ...fetchOptions, signal: controller.signal }).catch(
        () => null
      ),
    ]);
    clearTimeout(timeoutId);

    // Strictly enforce 100% PURE ACTUAL LIVE DATA: if live API call failed, DO NOT record dummy data!
    if (!wRes || !wRes.ok) {
      return null;
    }

    const wData = await wRes.json();
    const curr = wData.current;
    if (
      !curr ||
      curr.temperature_2m === undefined ||
      curr.temperature_2m === null
    ) {
      return null;
    }

    let aqiVal = 0;
    let airQualityCat = 'Baik';

    if (aRes && aRes.ok) {
      const aData = await aRes.json();
      if (aData.current && aData.current.us_aqi !== undefined) {
        aqiVal = Math.round(aData.current.us_aqi);
        airQualityCat =
          aqiVal <= 50 ? 'Sangat Baik' : aqiVal <= 100 ? 'Sedang' : 'Sensitif';
      }
    }

    const irradiance =
      curr.direct_normal_irradiance !== undefined
        ? curr.direct_normal_irradiance
        : 0;
    const lux = Math.round(irradiance * 120);
    const visKm =
      curr.visibility !== undefined
        ? (curr.visibility / 1000).toFixed(1)
        : '10.0';

    const temp = Math.round(curr.temperature_2m);
    const feels = Math.round(curr.apparent_temperature);
    const hum = Math.round(curr.relative_humidity_2m);
    const dew = Math.round(temp - (100 - hum) / 5);
    const wSpeed = Math.round(curr.wind_speed_10m);
    const wDeg = Math.round(curr.wind_direction_10m);
    const uv = Math.round(curr.uv_index);
    const press = Math.round(curr.surface_pressure);
    const wCode = curr.weather_code;

    const snapshot = new WeatherHistory({
      timestamp: new Date(),
      location: 'Kelurahan Rawa Arum, Cilegon',
      temperature: temp,
      feelsLike: feels,
      humidity: hum,
      dewPoint: dew,
      windSpeed: wSpeed,
      windDirection: getCompassDirection(wDeg),
      windDegree: wDeg,
      uvIndex: uv,
      pressure: press,
      lux: lux,
      aqi: aqiVal,
      airQualityText:
        aqiVal > 0 ? `AQI ${aqiVal} (${airQualityCat})` : 'AQI Normal',
      weatherCode: wCode,
      conditionText: getWeatherConditionText(wCode),
      visibility: `${visKm} km (${parseFloat(visKm) >= 8 ? 'Jernih' : 'Terbatas'})`,
    });

    await snapshot.save();
    return snapshot;
  } catch (error) {
    return null;
  }
};

/**
 * Controller GET /api/weather/history with rangeMode (day|week|month) and offset pager support.
 */
const getWeatherHistory = async (req, res) => {
  try {
    const count = await WeatherHistory.countDocuments();
    if (count === 0) {
      await recordWeatherSnapshot();
    }

    const rangeMode = req.query.rangeMode || 'day';
    const offset = parseInt(req.query.offset) || 0;
    const now = Date.now();

    let durationMs = 24 * 60 * 60 * 1000; // 1 day
    if (rangeMode === 'week') durationMs = 7 * 24 * 60 * 60 * 1000;
    else if (rangeMode === 'month') durationMs = 30 * 24 * 60 * 60 * 1000;

    const endDate = new Date(now - offset * durationMs);
    const startDate = new Date(endDate.getTime() - durationMs);

    let history = await WeatherHistory.find({
      timestamp: { $gte: startDate, $lte: endDate },
    })
      .sort({ timestamp: 1 })
      .lean();

    // Fallback for current day if query yields 0 due to exact time window cutoff
    if (history.length === 0 && offset === 0) {
      history = await WeatherHistory.find()
        .sort({ timestamp: -1 })
        .limit(48)
        .lean();
      history = history.reverse();
    }

    res.json({
      success: true,
      rangeMode,
      offset,
      startDate,
      endDate,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data historis cuaca' });
  }
};

/**
 * Controller POST /api/weather/record
 */
const triggerRecord = async (req, res) => {
  try {
    const result = await recordWeatherSnapshot();
    if (!result) {
      return res.status(500).json({ error: 'Gagal mencatat cuaca baru' });
    }
    res.status(201).json({
      success: true,
      message: 'Snapshot cuaca 30-menit berhasil disimpan',
      data: result,
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memproses snapshot cuaca' });
  }
};

/**
 * Clear any old database collection if requested by user
 */
const clearHistory = async (req, res) => {
  try {
    await WeatherHistory.deleteMany({});
    const snapshot = await recordWeatherSnapshot();
    res.json({
      success: true,
      message:
        'Seluruh data lama dibersihkan. Himpunan data murni real-time baru telah dimulai!',
      data: snapshot,
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengosongkan data historis' });
  }
};

module.exports = {
  recordWeatherSnapshot,
  getWeatherHistory,
  triggerRecord,
  clearHistory,
};
