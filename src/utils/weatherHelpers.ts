import { RecommendationInfo, WeatherCondition } from '../types';

export function getWMOCondition(code: number): WeatherCondition {
  // 0: Clear Sky (Sun icon, amber-400 to orange-500 gradient background)
  if (code === 0) {
    return {
      text: 'Clear Sky',
      icon: 'Sun',
      gradient: 'from-amber-400 to-orange-500',
      color: '#f59e0b'
    };
  }
  // 1, 2, 3: Partly Cloudy / Overcast (Cloud icon, blue-400 to indigo-500 gradient)
  if (code === 1 || code === 2 || code === 3) {
    return {
      text: code === 1 ? 'Mainly Clear' : code === 2 ? 'Partly Cloudy' : 'Overcast',
      icon: 'Cloud',
      gradient: 'from-blue-400 to-indigo-500',
      color: '#3b82f6'
    };
  }
  // 45, 48: Fog (CloudFog icon, gray-400 to slate-500 gradient)
  if (code === 45 || code === 48) {
    return {
      text: code === 45 ? 'Fog' : 'Depositing Rime Fog',
      icon: 'CloudFog',
      gradient: 'from-gray-400 to-slate-500',
      color: '#94a3b8'
    };
  }
  // 51, 53, 55: Drizzle (CloudRain icon, teal-400 to cyan-600 gradient)
  if (code === 51 || code === 53 || code === 55) {
    return {
      text: 'Drizzle',
      icon: 'CloudRain',
      gradient: 'from-teal-400 to-cyan-600',
      color: '#0d9488'
    };
  }
  // 61, 63, 65: Rain (CloudRain icon, blue-500 to indigo-600 gradient)
  if (code === 61 || code === 63 || code === 65) {
    return {
      text: 'Rain',
      icon: 'CloudRain',
      gradient: 'from-blue-500 to-indigo-600',
      color: '#2563eb'
    };
  }
  // 71, 73, 75, 77: Snowfall (CloudSnow icon, sky-300 to blue-400 gradient)
  if (code === 71 || code === 73 || code === 75 || code === 77) {
    return {
      text: 'Snowfall',
      icon: 'CloudSnow',
      gradient: 'from-sky-300 to-blue-400',
      color: '#0ea5e9'
    };
  }
  // 80, 81, 82: Showers (CloudRain icon, blue-600 to sky-700 gradient)
  if (code === 80 || code === 81 || code === 82) {
    return {
      text: 'Showers',
      icon: 'CloudRain',
      gradient: 'from-blue-600 to-sky-700',
      color: '#1d4ed8'
    };
  }
  // 95, 96, 99: Thunderstorms (CloudLightning icon, purple-600 to violet-800 gradient)
  if (code === 95 || code === 96 || code === 99) {
    return {
      text: 'Thunderstorm',
      icon: 'CloudLightning',
      gradient: 'from-purple-600 to-violet-800',
      color: '#7c3aed'
    };
  }
  
  // Extra default maps for robustness if api returns codes like 56, 57, 66, 67, 85, 86
  if (code === 56 || code === 57 || code === 66 || code === 67) {
    return {
      text: 'Freezing Rain',
      icon: 'CloudSnow',
      gradient: 'from-cyan-300 to-blue-500',
      color: '#06b6d4'
    };
  }
  if (code === 85 || code === 86) {
    return {
      text: 'Snow Showers',
      icon: 'CloudSnow',
      gradient: 'from-sky-300 to-blue-500',
      color: '#0ea5e9'
    };
  }

  return {
    text: 'Unknown Conditions',
    icon: 'Cloud',
    gradient: 'from-blue-400 to-slate-500',
    color: '#64748b'
  };
}

export function getRecommendation(weatherCode: number, tempC: number): RecommendationInfo {
  // 1. Thunderstorms (Codes >= 95): Severe thunderstorms expected. Stay indoors, secure lightweight items, and avoid travel.
  if (weatherCode >= 95) {
    return {
      title: 'Severe Thunderstorm Warning',
      message: 'Severe thunderstorms expected. Stay indoors, secure lightweight items, and avoid travel.',
      severity: 'severe'
    };
  }

  // 2. Snow/Ice (Codes 71-86) (Snowfall, snow showers)
  if (weatherCode >= 71 && weatherCode <= 86) {
    return {
      title: 'Snow & Ice Advisory',
      message: 'Snowy conditions forecast. Dress in heavy layers, wear thermal footwear, and check local road safety.',
      severity: 'warning'
    };
  }

  // 3. Rain/Drizzle (Codes 51-82): Rain expected today. Carry an umbrella, wear waterproof gear, and plan indoor activities.
  if (weatherCode >= 51 && weatherCode <= 82) {
    return {
      title: 'Rain & Drizzle Alert',
      message: 'Rain expected today. Carry an umbrella, wear waterproof gear, and plan indoor activities.',
      severity: 'warning'
    };
  }

  // 4. Fog (Codes 45-48): Heavy fog detected. Visibilities are highly reduced; drive slowly and use low-beam headlights.
  if (weatherCode === 45 || weatherCode === 48) {
    return {
      title: 'Heavy Fog Alert',
      message: 'Heavy fog detected. Visibilities are highly reduced; drive slowly and use low-beam headlights.',
      severity: 'warning'
    };
  }

  // 5. Extreme Heat (Temp >= 35°C): Extreme heat advisory. Stay hydrated, avoid direct sun exposure, and schedule outdoor trips early.
  if (tempC >= 35) {
    return {
      title: 'Extreme Heat Advisory',
      message: 'Extreme heat advisory. Stay hydrated, avoid direct sun exposure, and schedule outdoor trips early.',
      severity: 'severe'
    };
  }

  // 6. Extreme Cold (Temp <= 5°C): Cold temperature advisory. Protect extremities with insulated layers, gloves, and windproof wear.
  if (tempC <= 5) {
    return {
      title: 'Extreme Cold Advisory',
      message: 'Cold temperature advisory. Protect extremities with insulated layers, gloves, and windproof wear.',
      severity: 'severe'
    };
  }

  // 7. Mild Weather (Default): Optimal conditions. Great day for outdoor planning, running, or visiting parks.
  return {
    title: 'Optimal Conditions',
    message: 'Optimal conditions. Great day for outdoor planning, running, or visiting parks.',
    severity: 'success'
  };
}

export function getWindDirection(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 22.5) % 16;
  return directions[index];
}

export function formatDayName(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
}

export function formatShortDay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

export function formatMonthDay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}
