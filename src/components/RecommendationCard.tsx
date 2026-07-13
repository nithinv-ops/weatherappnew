import React from 'react';
import { CurrentWeather } from '../types';
import { getRecommendation } from '../utils/weatherHelpers';
import { WeatherIcon } from './WeatherIcon';
import { motion } from 'motion/react';

interface RecommendationCardProps {
  weather: CurrentWeather;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ weather }) => {
  const recommendation = getRecommendation(weather.weather_code, weather.temperature_2m);
  
  // Custom design schemes based on severity level
  let bgStyles = '';
  let borderStyles = '';
  let textStyles = '';
  let badgeStyles = '';
  let iconName = '';
  let iconColor = '';

  switch (recommendation.severity) {
    case 'severe':
      bgStyles = 'bg-rose-500/10 dark:bg-rose-950/20 backdrop-blur-md';
      borderStyles = 'border-rose-200 dark:border-rose-900/40';
      textStyles = 'text-rose-950 dark:text-rose-100';
      badgeStyles = 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80';
      iconName = 'AlertOctagon';
      iconColor = 'text-rose-600 dark:text-rose-400';
      break;
    case 'warning':
      bgStyles = 'bg-amber-500/10 dark:bg-amber-950/15 backdrop-blur-md';
      borderStyles = 'border-amber-200 dark:border-amber-900/30';
      textStyles = 'text-amber-950 dark:text-amber-100';
      badgeStyles = 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80';
      iconName = 'AlertTriangle';
      iconColor = 'text-amber-600 dark:text-amber-400';
      break;
    case 'success':
      bgStyles = 'bg-emerald-500/10 dark:bg-emerald-950/15 backdrop-blur-md';
      borderStyles = 'border-emerald-200 dark:border-emerald-900/30';
      textStyles = 'text-emerald-950 dark:text-emerald-100';
      badgeStyles = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80';
      iconName = 'CheckCircle';
      iconColor = 'text-emerald-600 dark:text-emerald-400';
      break;
    default:
      bgStyles = 'bg-slate-100/60 dark:bg-white/5 backdrop-blur-md';
      borderStyles = 'border-slate-200/80 dark:border-white/10';
      textStyles = 'text-slate-800 dark:text-slate-100';
      badgeStyles = 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/40 dark:border-slate-700';
      iconName = 'Info';
      iconColor = 'text-indigo-600 dark:text-indigo-400';
  }

  // Generate helper check tips depending on the condition
  const getHelperChecklist = () => {
    const code = weather.weather_code;
    const temp = weather.temperature_2m;

    if (code >= 95) {
      return [
        { label: 'Outdoor Activities', val: 'CRITICAL WARNING - Do not attempt', status: 'bad' },
        { label: 'Travel Planning', val: 'AVOID TRAVEL - Roads may be blocked', status: 'bad' },
        { label: 'Electronics Safety', val: 'Unplug sensitive electrical devices', status: 'info' }
      ];
    }
    if (code >= 71 && code <= 86) {
      return [
        { label: 'Attire', val: 'Thermal Base Layer + Heavy Coat + Gloves', status: 'info' },
        { label: 'Footwear', val: 'Waterproof insulated boots with traction', status: 'info' },
        { label: 'Commute', val: 'Check brake fluid & road salt announcements', status: 'warning' }
      ];
    }
    if (code >= 51 && code <= 82) {
      return [
        { label: 'Gear Required', val: 'Windproof Umbrella & Rain Slicker', status: 'warning' },
        { label: 'Activity Index', val: 'Indoor alternatives recommended', status: 'info' },
        { label: 'Dry Time', val: 'Increased humidity: Hair / clothes dry slowly', status: 'info' }
      ];
    }
    if (code === 45 || code === 48) {
      return [
        { label: 'Driving Mode', val: 'LOW-BEAM Headlights & Double space margin', status: 'warning' },
        { label: 'Pedestrian Alert', val: 'Wear bright clothing or light markers', status: 'info' }
      ];
    }
    if (temp >= 35) {
      return [
        { label: 'Hydration Target', val: 'Drink at least 3-4 liters of water', status: 'warning' },
        { label: 'Sunscreen Protection', val: 'Broad Spectrum SPF 50+ (Reapply 2h)', status: 'warning' },
        { label: 'Peak Hour Avoidance', val: 'Stay indoors between 11 AM - 4 PM', status: 'severe' }
      ];
    }
    if (temp <= 5) {
      return [
        { label: 'Skin Protection', val: 'Cover exposed skin; protect against windchill', status: 'severe' },
        { label: 'Layering Rule', val: 'Moisture-wicking base + fleece + outer shell', status: 'info' },
        { label: 'Warm Liquids', val: 'Keep thermos filled with tea / warm soups', status: 'info' }
      ];
    }
    
    // Default Mild weather checklist
    return [
      { label: 'Outdoor Fitness', val: 'Optimal for jogging, cycling & hiking', status: 'good' },
      { label: 'Sun Index', val: 'Moderate - wear standard UV sunglasses', status: 'good' },
      { label: 'Comfort Level', val: 'Highly comfortable - breathable cotton apparel', status: 'good' }
    ];
  };

  const checklist = getHelperChecklist();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`rounded-[2.5rem] p-8 md:p-10 border shadow-2xl ${bgStyles} ${borderStyles} ${textStyles} relative overflow-hidden`}
    >
      {/* Absolute styled background accent bubble */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/5 dark:bg-black/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col gap-5">
        {/* Title and Icon */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className={`self-start px-3 py-1 text-[11px] font-bold font-mono rounded-full uppercase tracking-wider ${badgeStyles}`}>
              Planning Advisory
            </span>
            <h3 className="text-xl md:text-2xl font-bold font-sans tracking-tight mt-1">
              {recommendation.title}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-white/50 dark:bg-slate-900/60 backdrop-blur-md shadow-md border border-white/20 dark:border-slate-800/80 shrink-0">
            <WeatherIcon name={iconName} className={`${iconColor}`} size={28} />
          </div>
        </div>

        {/* Primary Message */}
        <p className="text-sm md:text-base font-sans leading-relaxed opacity-90">
          {recommendation.message}
        </p>

        {/* Intelligence Checklist Panel */}
        <div className="mt-2">
          <h4 className="text-[11px] font-bold uppercase tracking-widest opacity-60 font-mono mb-3">
            WEATHER PLANNING CHECKLIST
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 flex flex-col justify-between hover:scale-[1.01] transition-transform"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold font-mono uppercase opacity-75">
                    {item.label}
                  </span>
                  {item.status === 'bad' || item.status === 'severe' ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  ) : item.status === 'warning' ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  ) : item.status === 'good' ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  )}
                </div>
                <p className="text-xs md:text-sm font-semibold font-sans mt-1">
                  {item.val}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation Badge Overlay */}
        <div className="flex items-center gap-2 mt-2 pt-4 border-t border-slate-200/40 dark:border-slate-800/40 text-[10px] md:text-xs opacity-50 font-mono">
          <WeatherIcon name="Sparkles" size={13} className="text-indigo-400" />
          <span>Decision Intelligence Engine active • Recalculates dynamically</span>
        </div>
      </div>
    </motion.div>
  );
};
