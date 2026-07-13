import React, { useState } from 'react';
import { DailyForecast } from '../types';
import { getWMOCondition, formatShortDay, formatMonthDay, cToF } from '../utils/weatherHelpers';
import { WeatherIcon } from './WeatherIcon';
import { motion, AnimatePresence } from 'motion/react';

interface ForecastSectionProps {
  daily: DailyForecast;
  unit: 'C' | 'F';
}

export const ForecastSection: React.FC<ForecastSectionProps> = ({ daily, unit }) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);

  // Parse total number of days returned (usually 7)
  const totalDays = daily.time.length;

  // Convert temperatures to selected unit
  const maxTemps = daily.temperature_2m_max.map((t) => (unit === 'C' ? Math.round(t) : cToF(t)));
  const minTemps = daily.temperature_2m_min.map((t) => (unit === 'C' ? Math.round(t) : cToF(t)));

  // Find absolute extremes for the week visualizer scale
  const weekMax = Math.max(...maxTemps);
  const weekMin = Math.min(...minTemps);
  const weekRange = weekMax - weekMin || 1; // Prevent divide-by-zero

  // Helper to generate visualizer bar styles based on temperature values
  const getBarColorGradient = (max: number) => {
    // If unit is Fahrenheit, threshold values must adjust
    const hotThreshold = unit === 'C' ? 28 : 82;
    const coldThreshold = unit === 'C' ? 12 : 54;

    if (max >= hotThreshold) {
      return 'bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500';
    } else if (max <= coldThreshold) {
      return 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600';
    } else {
      return 'bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-400';
    }
  };

  // Get details of selected day for the side details view
  const selectedDate = daily.time[selectedDayIdx];
  const selectedWMO = daily.weather_code[selectedDayIdx];
  const selectedCondition = getWMOCondition(selectedWMO);
  const selectedMax = maxTemps[selectedDayIdx];
  const selectedMin = minTemps[selectedDayIdx];
  const selectedPrecipSum = daily.precipitation_sum[selectedDayIdx];
  const selectedPrecipProb = daily.precipitation_probability_max[selectedDayIdx];

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-xl md:text-2xl font-medium font-sans tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <WeatherIcon name="Calendar" className="text-indigo-500" size={20} />
            <span>7-Day Meteorological Forecast</span>
          </h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Click any day to examine detailed precipitations, trend index, and activity advisories.
          </p>
        </div>
        <div className="text-[10px] md:text-xs font-mono px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 self-start md:self-auto border border-slate-200/50 dark:border-white/10">
          WEEK EXTREMES: {weekMin}°{unit} to {weekMax}°{unit}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Columns (Span 2): The 7-Day interactive list */}
        <div className="lg:col-span-2 flex flex-col gap-2.5">
          {Array.from({ length: totalDays }).map((_, idx) => {
            const dateStr = daily.time[idx];
            const wmoCode = daily.weather_code[idx];
            const condition = getWMOCondition(wmoCode);
            const maxTemp = maxTemps[idx];
            const minTemp = minTemps[idx];
            const isSelected = selectedDayIdx === idx;

            // Calculate percentage range relative to overall week extremes
            const leftOffset = ((minTemp - weekMin) / weekRange) * 100;
            const barWidth = ((maxTemp - minTemp) / weekRange) * 100;

            return (
              <motion.button
                key={dateStr}
                onClick={() => setSelectedDayIdx(idx)}
                whileHover={{ scale: 1.005, x: 2 }}
                whileTap={{ scale: 0.995 }}
                className={`w-full text-left p-5 rounded-3xl flex items-center gap-4 transition-all border ${
                  isSelected
                    ? 'bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500/40 dark:border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20'
                    : 'bg-slate-100/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10 hover:bg-slate-100/70 dark:hover:bg-white/10'
                }`}
              >
                {/* Day & Date info */}
                <div className="w-20 md:w-24 shrink-0 flex flex-col justify-center">
                  <span className="text-sm md:text-base font-bold font-sans text-slate-800 dark:text-slate-100">
                    {idx === 0 ? 'Today' : formatShortDay(dateStr)}
                  </span>
                  <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-mono">
                    {formatMonthDay(dateStr)}
                  </span>
                </div>

                {/* Icon & Description details */}
                <div className="flex items-center gap-2 w-28 md:w-36 shrink-0">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${condition.gradient} text-white shrink-0 shadow-sm`}>
                    <WeatherIcon name={condition.icon} size={16} />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate font-sans">
                    {condition.text}
                  </span>
                </div>

                {/* Min Temp */}
                <div className="w-8 text-right font-mono text-xs md:text-sm text-slate-400 dark:text-slate-500 font-medium">
                  {minTemp}°
                </div>

                {/* The Interactive Trend Range Visualizer Bar */}
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden hidden sm:block">
                  <div
                    className={`absolute h-full rounded-full ${getBarColorGradient(maxTemp)}`}
                    style={{
                      left: `${Math.max(0, Math.min(leftOffset, 100))}%`,
                      width: `${Math.max(5, Math.min(barWidth, 100))}%`, // minimum 5% width to ensure visible range
                    }}
                  />
                </div>

                {/* Max Temp */}
                <div className="w-8 text-left font-mono text-xs md:text-sm text-slate-800 dark:text-slate-200 font-semibold">
                  {maxTemp}°
                </div>

                {/* Chevron selector pointer */}
                <WeatherIcon
                  name="ChevronRight"
                  size={16}
                  className={`transition-transform duration-300 shrink-0 ${
                    isSelected ? 'text-indigo-500 translate-x-1' : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              </motion.button>
            );
          })}
        </div>

        {/* Right Column (Span 1): Selected Day detailed panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDayIdx}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.3 }}
            className="rounded-[2.5rem] p-8 bg-slate-100/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 backdrop-blur-xl shadow-2xl flex flex-col justify-between h-full min-h-[400px] lg:min-h-full"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-white/10 pb-4 mb-5">
                <div>
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-indigo-500">
                    Day Insight
                  </span>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans">
                    {formatShortDay(selectedDate)} — {formatMonthDay(selectedDate)}
                  </h4>
                </div>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${selectedCondition.gradient} text-white shadow-md`}>
                  <WeatherIcon name={selectedCondition.icon} size={20} />
                </div>
              </div>

              {/* Day Quick Condition Description */}
              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 font-mono block mb-1">
                  PREVAILING CONDITIONS
                </span>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200 font-sans">
                  {selectedCondition.text}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    Min: <strong className="text-slate-800 dark:text-white font-semibold">{selectedMin}°{unit}</strong>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Max: <strong className="text-slate-800 dark:text-white font-semibold">{selectedMax}°{unit}</strong>
                  </span>
                </div>
              </div>

              {/* Day Precipitation metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3.5 rounded-2xl bg-white/30 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-mono uppercase font-bold mb-1">
                    <WeatherIcon name="Droplets" className="text-indigo-400" size={12} />
                    <span>Rain Prob.</span>
                  </div>
                  <p className="text-lg font-bold font-sans text-slate-800 dark:text-slate-100">
                    {selectedPrecipProb}%
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/30 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-mono uppercase font-bold mb-1">
                    <WeatherIcon name="CloudRain" className="text-blue-400" size={12} />
                    <span>Rain Vol.</span>
                  </div>
                  <p className="text-lg font-bold font-sans text-slate-800 dark:text-slate-100">
                    {selectedPrecipSum} mm
                  </p>
                </div>
              </div>

              {/* Day planning insight */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 dark:bg-indigo-950/20 border border-indigo-500/20 dark:border-indigo-900/30">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-500 font-mono block mb-1">
                  DAILY ACTIVITY INSIGHT
                </span>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-sans">
                  {selectedWMO >= 51 && selectedWMO <= 82
                    ? 'Outdoor plans could be wet. Carry reliable rain equipment and consider scheduling indoor activities or visiting local cafes.'
                    : selectedWMO >= 71 && selectedWMO <= 86
                    ? 'Slick surfaces and snow likely today. Keep insulated footwear handy and check highway reports before taking long commutes.'
                    : selectedWMO >= 95
                    ? 'Unstable atmospheric conditions and lightning expected. Avoid tall metallic structures and remain in structurally secure enclosures.'
                    : 'Optimal atmospheric profile forecast. Excellent window for park tours, backyard BBQs, running routines, and visual arts.'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              <WeatherIcon name="Sparkles" size={12} className="text-indigo-400 shrink-0" />
              <span>Interactive Trend Engine • Selected Day {selectedDayIdx + 1} of 7</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
