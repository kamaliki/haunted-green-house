'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WeatherData } from '@/types';

export interface WeatherWidgetProps {
  weatherData?: WeatherData;
  isLoading?: boolean;
  error?: string;
}

/**
 * Weather widget component with spooky retro styling
 * Displays current weather conditions and expandable forecast
 */
export function WeatherWidget({ weatherData, isLoading, error }: WeatherWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get weather icon based on conditions
  const getWeatherIcon = (conditions: string) => {
    const condition = conditions.toLowerCase();
    if (condition.includes('rain') || condition.includes('storm')) return '🌧️';
    if (condition.includes('cloud')) return '☁️';
    if (condition.includes('sun') || condition.includes('clear')) return '☀️';
    if (condition.includes('snow')) return '❄️';
    if (condition.includes('fog') || condition.includes('mist')) return '🌫️';
    return '🌤️'; // Default
  };

  // Format temperature
  const formatTemp = (temp: number) => `${Math.round(temp)}°C`;

  // Format last update time
  const lastUpdateText = useMemo(() => {
    if (!weatherData?.lastUpdate) return 'No data';
    
    const now = new Date();
    const diffMs = now.getTime() - weatherData.lastUpdate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }, [weatherData?.lastUpdate]);

  // Check if data is stale (older than 2 hours)
  const isStale = useMemo(() => {
    if (!weatherData?.lastUpdate) return true;
    const now = new Date();
    const diffMs = now.getTime() - weatherData.lastUpdate.getTime();
    return diffMs > 2 * 60 * 60 * 1000; // 2 hours
  }, [weatherData?.lastUpdate]);

  if (isLoading) {
    return (
      <div className="retro-card fog-overlay">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-press-start text-xs text-ghost-green">
            WEATHER
          </h3>
          <div className="animate-spin text-2xl">🌀</div>
        </div>
        <div className="space-y-3">
          <div className="h-8 bg-bg-darkest rounded animate-pulse" />
          <div className="h-4 bg-bg-darkest rounded animate-pulse" />
          <div className="h-4 bg-bg-darkest rounded animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="retro-card fog-overlay border-pumpkin-orange">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-press-start text-xs text-pumpkin-orange">
            WEATHER
          </h3>
          <span className="text-2xl">⚠️</span>
        </div>
        <div className="space-y-2">
          <p className="font-vt323 text-sm text-text-secondary">
            {error || 'Weather data unavailable'}
          </p>
          <button 
            className="text-xs text-ghost-green hover:text-slime-green transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`
        retro-card fog-overlay cursor-pointer
        ${isStale ? 'border-pumpkin-orange' : 'border-ghost-green'}
        transition-all duration-300
        hover:scale-105
        hover:animate-float
      `}
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.02 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-press-start text-xs ${isStale ? 'text-pumpkin-orange' : 'text-ghost-green'}`}>
          WEATHER
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getWeatherIcon(weatherData.conditions)}</span>
          <motion.span
            className="text-sm"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            🔽
          </motion.span>
        </div>
      </div>

      {/* Current Conditions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-vt323 text-3xl text-bone-white">
              {formatTemp(weatherData.temperature)}
            </p>
            <p className="font-vt323 text-sm text-text-secondary">
              {weatherData.conditions}
            </p>
          </div>
          <div className="text-right">
            <p className="font-vt323 text-sm text-text-secondary">
              Humidity
            </p>
            <p className="font-vt323 text-lg text-bone-white">
              {Math.round(weatherData.humidity)}%
            </p>
          </div>
        </div>

        {/* Last Update */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary">Updated:</span>
          <span className={`font-vt323 ${isStale ? 'text-pumpkin-orange' : 'text-ghost-green'}`}>
            {lastUpdateText}
          </span>
        </div>
      </div>

      {/* Expanded Forecast */}
      <AnimatePresence>
        {isExpanded && weatherData.forecast && weatherData.forecast.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-bg-medium overflow-hidden"
          >
            <h4 className="font-press-start text-xs text-ghost-green mb-3">
              5-DAY FORECAST
            </h4>
            <div className="space-y-2">
              {weatherData.forecast.slice(0, 5).map((day, index) => (
                <motion.div
                  key={day.date.toISOString()}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getWeatherIcon(day.conditions)}</span>
                    <span className="font-vt323 text-text-secondary w-12">
                      {day.date.toLocaleDateString('en', { weekday: 'short' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-vt323 text-bone-white">
                      {formatTemp(day.tempHigh)}
                    </span>
                    <span className="font-vt323 text-text-secondary">
                      {formatTemp(day.tempLow)}
                    </span>
                    {day.precipitation > 0 && (
                      <span className="font-vt323 text-xs text-toxic-purple">
                        {Math.round(day.precipitation)}%
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spooky decoration */}
      <div className="absolute top-0 right-0 text-lg opacity-20 pointer-events-none">
        🌙
      </div>
    </motion.div>
  );
}