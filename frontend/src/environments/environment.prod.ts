const localApiBaseUrl = 'http://localhost:8080/api/v1';
// Default to same-origin `/api/v1`. Override this value for cross-origin deployments.
const deployedApiBaseUrl = '/api/v1';
const isBrowser = typeof window !== 'undefined';
const isLocalHost = isBrowser && ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const environment = {
  production: true,
  apiBaseUrl: isLocalHost ? localApiBaseUrl : deployedApiBaseUrl,
  localApiBaseUrl,
  deployedApiBaseUrl,
  appBaseUrl: isBrowser ? window.location.origin : 'http://localhost:4200',
};
