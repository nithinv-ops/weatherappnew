import { useState, useEffect } from 'react';
import { GeocodingResult, WeatherResponse } from './types';
import { SearchCity } from './components/SearchCity';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { RecommendationCard } from './components/RecommendationCard';
import { ForecastSection } from './components/ForecastSection';
import { WeatherIcon } from './components/WeatherIcon';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_CITY: GeocodingResult = {
  id: 1850147,
  name: 'Tokyo',
  latitude: 35.6895,
  longitude: 139.6917,
  timezone: 'Asia/Tokyo',
  country: 'Japan',
  country_code: 'JP',
};

const PRESET_CITIES: GeocodingResult[] = [
  { id: 1850147, name: 'Tokyo', latitude: 35.6895, longitude: 139.6917, timezone: 'Asia/Tokyo', country: 'Japan', country_code: 'JP' },
  { id: 5128581, name: 'New York', latitude: 40.7143, longitude: -74.006, timezone: 'America/New_York', country: 'United States', country_code: 'US' },
  { id: 2643743, name: 'London', latitude: 51.5085, longitude: -0.1257, timezone: 'Europe/London', country: 'United Kingdom', country_code: 'GB' },
  { id: 360630, name: 'Cairo', latitude: 30.0626, longitude: 31.2497, timezone: 'Africa/Cairo', country: 'Egypt', country_code: 'EG' },
  { id: 3413829, name: 'Reykjavik', latitude: 64.1355, longitude: -21.8954, timezone: 'Atlantic/Reykjavik', country: 'Iceland', country_code: 'IS' },
];

export default function App() {
  const [selectedCity, setSelectedCity] = useState<GeocodingResult>(() => {
    try {
      const stored = localStorage.getItem('weather_selected_city');
      return stored ? JSON.parse(stored) : DEFAULT_CITY;
    } catch {
      return DEFAULT_CITY;
    }
  });

  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Temperature unit preference: Celsius or Fahrenheit
  const [unit, setUnit] = useState<'C' | 'F'>(() => {
    try {
      const stored = localStorage.getItem('weather_temp_unit');
      return stored === 'F' ? 'F' : 'C';
    } catch {
      return 'C';
    }
  });

  // Theme configuration: Light/Dark
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('weather_theme');
      return stored === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Apply theme to HTML tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('weather_theme', theme);
  }, [theme]);

  // Save selected city preference
  useEffect(() => {
    localStorage.setItem('weather_selected_city', JSON.stringify(selectedCity));
  }, [selectedCity]);

  // Fetch forecast data whenever selectedCity changes
  const fetchWeather = async (city: GeocodingResult) => {
    setLoading(true);
    setError(null);
    try {
      // Normalize timezone: handle empty values, spaces, or invalid placeholders
      const normalizedTimezone = city.timezone && city.timezone !== 'undefined'
        ? city.timezone.trim().replace(/\s+/g, '_')
        : 'auto';

      let url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=${encodeURIComponent(
        normalizedTimezone
      )}`;
      
      let response = await fetch(url);
      
      // Fallback: If the request fails (e.g. because of an invalid timezone name), retry with auto-timezone
      if (!response.ok && normalizedTimezone !== 'auto') {
        console.warn(`Weather query with timezone '${normalizedTimezone}' failed. Retrying with 'auto' timezone...`);
        url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;
        response = await fetch(url);
      }

      if (!response.ok) {
        throw new Error('Search Exception: Weather forecasting service failed to respond.');
      }
      
      const data = await response.json();
      if (!data.current || !data.daily) {
        throw new Error('Search Exception: Incomplete meteorological response.');
      }
      
      setWeatherData(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          'Search Exception: Unstable network connection. Please verify coordinates.'
      );
      // Reset stale weather data to prevent rendering incorrect information
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity]);

  const handleToggleUnit = () => {
    setUnit((prev) => {
      const next = prev === 'C' ? 'F' : 'C';
      localStorage.setItem('weather_temp_unit', next);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-500 font-sans selection:bg-indigo-500 selection:text-white pb-16 overflow-x-hidden relative">
      {/* Decorative Blur Spheres - Adds gorgeous organic depth without clutter */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/15 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/15 dark:bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Sticky Header with elegant glassmorphism */}
      <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-slate-950/75 backdrop-blur-md border-b border-slate-200/50 dark:border-white/5 transition-colors">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20 animate-pulse">
              <WeatherIcon name="Cloud" size={20} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold font-sans tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                Aero<span className="font-light text-slate-800 dark:text-slate-300">Mind</span>
              </h1>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono font-bold block leading-none">
                Weather Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Real-time local connection status */}
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              CLIENT-SIDE SECURE
            </span>

            {/* Theme switcher */}
            <button
              onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-slate-500 dark:text-slate-400"
              title="Switch light/dark theme"
            >
              <WeatherIcon name={theme === 'light' ? 'Moon' : 'Sun'} size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 mt-6 md:mt-10 relative z-10">
        {/* Intro Branding Card & Global Search Block */}
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl md:text-5xl font-light font-sans tracking-tight text-slate-900 dark:text-white"
          >
            Predictive Decision Engine
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-sans mt-2"
          >
            Search global coordinates with automated geocoding. Track meteorological conditions with real-time rules-based activity planning guidelines.
          </motion.p>

          <div className="mt-6 md:mt-8">
            <SearchCity onSelectCity={setSelectedCity} selectedCity={selectedCity} />
          </div>

          {/* Quick Choice Preset Cities Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 dark:text-slate-500 tracking-wider mr-1">
              Presets:
            </span>
            {PRESET_CITIES.map((city) => {
              const isSelected = selectedCity.id === city.id;
              return (
                <button
                  key={city.id}
                  onClick={() => setSelectedCity(city)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25 ring-1 ring-indigo-500'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {city.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic State Layout (Loading / Error / Success) */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Showcase Loader */}
              <div className="w-full h-80 rounded-[2.5rem] bg-slate-200/60 dark:bg-slate-900/40 animate-pulse border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center gap-4 text-slate-400">
                <WeatherIcon name="RefreshCw" className="animate-spin text-indigo-500" size={32} />
                <span className="font-mono text-xs uppercase tracking-wider text-slate-500 animate-pulse">
                  Querying Open-Meteo API...
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-44 rounded-[2.5rem] bg-slate-200/60 dark:bg-slate-900/40 animate-pulse border border-slate-200/50 dark:border-slate-800/50" />
                <div className="h-44 rounded-[2.5rem] bg-slate-200/60 dark:bg-slate-900/40 animate-pulse border border-slate-200/50 dark:border-slate-800/50" />
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error-card"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 md:p-8 text-center text-rose-800 dark:text-rose-300 shadow-xl"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-900/30">
                <WeatherIcon name="AlertTriangle" size={24} />
              </div>
              <h3 className="text-xl font-bold font-display mb-2 text-rose-950 dark:text-rose-100">
                Search Exception Triggered
              </h3>
              <p className="text-sm font-sans mb-6 leading-relaxed">
                {error}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => fetchWeather(selectedCity)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all flex items-center gap-2 active:scale-95"
                >
                  <WeatherIcon name="RefreshCw" size={14} />
                  <span>Retry Connection</span>
                </button>
                <button
                  onClick={() => setSelectedCity(DEFAULT_CITY)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all active:scale-95"
                >
                  Reset to Tokyo
                </button>
              </div>
            </motion.div>
          ) : weatherData ? (
            <motion.div
              key="success-dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Dynamic Showcase Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
                {/* Weather Card - Spans 3 columns on large screens */}
                <div className="lg:col-span-3 flex">
                  <CurrentWeatherCard
                    weather={weatherData.current}
                    city={selectedCity}
                    unit={unit}
                    onToggleUnit={handleToggleUnit}
                  />
                </div>

                {/* Recommendation Card - Spans 2 columns on large screens */}
                <div className="lg:col-span-2 flex">
                  <RecommendationCard weather={weatherData.current} />
                </div>
              </div>

              {/* 7-Day Forecast Section */}
              <div className="mt-8 bg-slate-100/40 dark:bg-white/5 rounded-[2.5rem] p-6 md:p-10 border border-slate-200/50 dark:border-white/10 shadow-2xl backdrop-blur-xl">
                <ForecastSection daily={weatherData.daily} unit={unit} />
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <WeatherIcon name="Search" className="mx-auto mb-3 animate-bounce" size={32} />
              <p>Type a location to initiate weather geocoding query.</p>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Styled Footer */}
      <footer className="max-w-6xl mx-auto px-4 mt-16 pt-8 border-t border-slate-200/50 dark:border-slate-900/50 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-mono">
        <div>
          © 2026 AeroMind Weather Intelligence Inc. • Runs entirely client-side.
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Open-Meteo API Grounded
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Tailwind v4 Config
          </span>
        </div>
      </footer>
    </div>
  );
}
