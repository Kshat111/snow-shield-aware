import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format date to readable string
export function formatDate(date) {
  if (!date) return '';
  
  if (typeof date === 'string' || typeof date === 'number') {
    date = new Date(date);
  }
  
  if (date instanceof Date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return '';
}

// Get risk level color
export function getRiskLevelColor(riskLevel) {
  switch (riskLevel?.toLowerCase()) {
    case 'low':
      return 'success';
    case 'medium':
      return 'warning';
    case 'high':
      return 'danger';
    case 'extreme':
      return 'danger-dark';
    default:
      return 'primary';
  }
}

// Get weather icon URL
export function getWeatherIconUrl(iconCode) {
  return `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

// Truncate text to a specific length
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
} 