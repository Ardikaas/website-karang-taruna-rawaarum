const mongoose = require('mongoose');

const weatherHistorySchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    location: {
      type: String,
      default: 'Kelurahan Rawa Arum, Cilegon',
    },
    temperature: {
      type: Number,
      required: true,
    },
    feelsLike: {
      type: Number,
      required: true,
    },
    humidity: {
      type: Number,
      required: true,
    },
    dewPoint: {
      type: Number,
      default: 0,
    },
    windSpeed: {
      type: Number,
      required: true,
    },
    windDirection: {
      type: String,
      default: 'Utara',
    },
    windDegree: {
      type: Number,
      default: 0,
    },
    uvIndex: {
      type: Number,
      default: 0,
    },
    pressure: {
      type: Number,
      default: 1012,
    },
    lux: {
      type: Number,
      default: 0,
    },
    aqi: {
      type: Number,
      default: 28,
    },
    airQualityText: {
      type: String,
      default: 'Sangat Baik',
    },
    weatherCode: {
      type: Number,
      default: 0,
    },
    conditionText: {
      type: String,
      default: 'Cerah',
    },
    visibility: {
      type: String,
      default: '10 km (Jernih)',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WeatherHistory', weatherHistorySchema);
