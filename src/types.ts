export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country?: string;
  admin1?: string;
  country_code?: string;
}

export interface CurrentWeather {
  time: string;
  interval: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
}

export interface DailyForecast {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current: CurrentWeather;
  daily: DailyForecast;
}

export interface WeatherCondition {
  text: string;
  icon: string; // we'll map this to standard Lucide icons at render time
  gradient: string; // Tailwind class gradients
  color: string; // Solid colors for accents
}

export interface RecommendationInfo {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'severe' | 'success';
}
