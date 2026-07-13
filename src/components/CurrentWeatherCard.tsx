import React from 'react';
import { CurrentWeather, GeocodingResult } from '../types';
import { getWMOCondition, getWindDirection, cToF } from '../utils/weatherHelpers';
import { WeatherIcon } from './WeatherIcon';
import { motion } from 'motion/react';

interface CurrentWeatherCardProps {
  weather: CurrentWeather;
  city: GeocodingResult;
  unit: 'C' | 'F';
  onToggleUnit: () => void;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weather,
  city,
  unit,
  onToggleUnit,
}) => {
  const condition = getWMOCondition(weather.weather_code);
  const temp = unit === 'C' ? Math.round(weather.temperature_2m) : cToF(weather.temperature_2m);
  const feelsLike = unit === 'C' ? Math.round(weather.apparent_temperature) : cToF(weather.apparent_temperature);
  const isDay = weather.is_day === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200/50 dark:border-white/10"
    >
      {/* Background Weather Gradient with dynamic day/night overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${condition.gradient} transition-all duration-700`} />
      
      {/* Night Overlay if is_day === 0 */}
      {!isDay && (
        <div className="absolute inset-0 bg-slate-950/40 mix-blend-multiply backdrop-brightness-75 transition-all duration-700" />
      )}

      {/* Decorative Grid Patterns & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_45%)]" />

      {/* Content Container */}
      <div className="relative p-8 md:p-10 text-white z-10 flex flex-col justify-between h-full">
        {/* Header Block: Location Name & Timezone info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <WeatherIcon name="MapPin" className="text-white animate-bounce shrink-0" size={18} />
              <h2 className="text-3xl md:text-4xl font-medium font-sans tracking-tight drop-shadow-md">
                {city.name}
              </h2>
              {city.country_code && (
                <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-white/20 backdrop-blur-md uppercase text-white border border-white/10">
                  {city.country_code}
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-white/80 font-medium font-sans">
              {city.admin1 ? `${city.admin1}, ` : ''}
              {city.country || 'Unknown Country'}
            </p>
            <p className="text-[10px] md:text-xs text-white/60 font-mono mt-1 uppercase tracking-wider">
              Timezone: {city.timezone}
            </p>
          </div>

          {/* Unit Switcher Button & Day/Night Indicator */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <span className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-black/20 backdrop-blur-md border border-white/10 font-mono">
              <span className={`w-2 h-2 rounded-full ${isDay ? 'bg-amber-400 animate-pulse' : 'bg-indigo-300'}`} />
              {isDay ? 'DAYTIME' : 'NIGHTTIME'}
            </span>
            <button
              onClick={onToggleUnit}
              className="px-3.5 py-1.5 text-sm font-bold font-mono rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 border border-white/20 backdrop-blur-md transition-all shadow-md text-white flex items-center gap-1.5"
              title="Toggle Celsius/Fahrenheit"
            >
              <WeatherIcon name="Thermometer" size={14} />
              <span>°{unit}</span>
            </button>
          </div>
        </div>

        {/* Temperature and Icon Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-8">
          {/* Main Temperature Display */}
          <div className="flex items-baseline gap-2">
            <span className="text-7xl md:text-[110px] font-light leading-none tracking-tighter drop-shadow-lg select-none font-sans">
              {temp}
            </span>
            <span className="text-3xl md:text-4xl font-light text-white/80 select-none">
              °{unit}
            </span>
            <div className="ml-4 md:ml-6 flex flex-col">
              <span className="text-lg md:text-2xl font-bold font-sans drop-shadow-sm flex items-center gap-2">
                {condition.text}
              </span>
              <span className="text-xs md:text-sm text-white/80 flex items-center gap-1 mt-0.5 font-sans">
                Feels like <strong className="font-semibold text-white">{feelsLike}°{unit}</strong>
              </span>
            </div>
          </div>

          {/* Icon Showcase with visual flair */}
          <div className="flex justify-start md:justify-end items-center">
            <div className="relative group p-4 bg-white/10 backdrop-blur-xl rounded-full border border-white/15 shadow-inner transition-transform duration-500 hover:rotate-6">
              <div className="absolute -inset-1 rounded-full bg-white/30 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500" />
              <WeatherIcon
                name={condition.icon}
                className="text-white drop-shadow-[0_8px_8px_rgba(255,255,255,0.3)] animate-pulse"
                size={80}
              />
            </div>
          </div>
        </div>

        {/* Meteorological Metrics Board */}
        <div className="border-t border-white/15 pt-6 mt-6 grid grid-cols-3 gap-4">
          {/* Relative Humidity */}
          <div className="flex flex-col gap-1.5 pl-2">
            <span className="text-[10px] md:text-xs text-white/60 font-bold uppercase tracking-widest font-sans flex items-center gap-1">
              <WeatherIcon name="Droplets" size={12} className="text-white/60 shrink-0" />
              <span>HUMIDITY</span>
            </span>
            <span className="text-lg md:text-2xl font-light font-sans">
              {weather.relative_humidity_2m}%
            </span>
          </div>

          {/* Wind Speed */}
          <div className="flex flex-col gap-1.5 border-l border-white/15 pl-4 md:pl-6">
            <span className="text-[10px] md:text-xs text-white/60 font-bold uppercase tracking-widest font-sans flex items-center gap-1">
              <WeatherIcon name="Wind" size={12} className="text-white/60 shrink-0" />
              <span>WIND</span>
            </span>
            <span className="text-lg md:text-2xl font-light font-sans">
              {weather.wind_speed_10m} <span className="text-xs md:text-sm text-white/60 font-light">km/h</span>
            </span>
          </div>

          {/* Wind Direction */}
          <div className="flex flex-col gap-1.5 border-l border-white/15 pl-4 md:pl-6">
            <span className="text-[10px] md:text-xs text-white/60 font-bold uppercase tracking-widest font-sans flex items-center gap-1">
              <WeatherIcon name="Compass" size={12} className="text-white/60 shrink-0" />
              <span>DIRECTION</span>
            </span>
            <span className="text-lg md:text-2xl font-light font-sans flex items-baseline gap-1">
              <span>{getWindDirection(weather.wind_direction_10m)}</span>
              <span className="text-[10px] md:text-xs text-white/60 font-mono font-light">({weather.wind_direction_10m}°)</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
