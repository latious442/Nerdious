const isBrowser = typeof window !== 'undefined';
const isVercelFrontend = isBrowser && window.location.hostname.endsWith('.vercel.app');
const defaultApiOrigin = isVercelFrontend
  ? 'https://nerdious-be.vercel.app'
  : 'http://localhost:3001';

const API_ORIGIN = process.env.REACT_APP_API_URL || defaultApiOrigin;

export function apiUrl(path) {
  return `${API_ORIGIN}${path}`;
}

export { API_ORIGIN };
