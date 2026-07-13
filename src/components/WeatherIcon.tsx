import React from 'react';
import {
  Sun,
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  Search,
  AlertTriangle,
  CheckCircle,
  Info,
  AlertOctagon,
  Compass,
  MapPin,
  Sparkles,
  RefreshCw,
  TrendingUp,
  SunDim,
  Navigation,
  Calendar,
  X,
  Star,
  ChevronRight,
  TrendingDown,
  History
} from 'lucide-react';

interface WeatherIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ name, className = '', size = 24 }) => {
  switch (name) {
    case 'Sun':
      return <Sun className={className} size={size} />;
    case 'Cloud':
      return <Cloud className={className} size={size} />;
    case 'CloudFog':
      return <CloudFog className={className} size={size} />;
    case 'CloudRain':
      return <CloudRain className={className} size={size} />;
    case 'CloudSnow':
      return <CloudSnow className={className} size={size} />;
    case 'CloudLightning':
      return <CloudLightning className={className} size={size} />;
    case 'Wind':
      return <Wind className={className} size={size} />;
    case 'Droplets':
      return <Droplets className={className} size={size} />;
    case 'Thermometer':
      return <Thermometer className={className} size={size} />;
    case 'Search':
      return <Search className={className} size={size} />;
    case 'AlertTriangle':
      return <AlertTriangle className={className} size={size} />;
    case 'CheckCircle':
      return <CheckCircle className={className} size={size} />;
    case 'Info':
      return <Info className={className} size={size} />;
    case 'AlertOctagon':
      return <AlertOctagon className={className} size={size} />;
    case 'Compass':
      return <Compass className={className} size={size} />;
    case 'MapPin':
      return <MapPin className={className} size={size} />;
    case 'Sparkles':
      return <Sparkles className={className} size={size} />;
    case 'RefreshCw':
      return <RefreshCw className={className} size={size} />;
    case 'TrendingUp':
      return <TrendingUp className={className} size={size} />;
    case 'SunDim':
      return <SunDim className={className} size={size} />;
    case 'Navigation':
      return <Navigation className={className} size={size} />;
    case 'Calendar':
      return <Calendar className={className} size={size} />;
    case 'X':
      return <X className={className} size={size} />;
    case 'Star':
      return <Star className={className} size={size} />;
    case 'ChevronRight':
      return <ChevronRight className={className} size={size} />;
    case 'TrendingDown':
      return <TrendingDown className={className} size={size} />;
    case 'History':
      return <History className={className} size={size} />;
    default:
      return <Cloud className={className} size={size} />;
  }
};
