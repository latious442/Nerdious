const API_ORIGIN = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export function apiUrl(path) {
  return `${API_ORIGIN}${path}`;
}

export { API_ORIGIN };
