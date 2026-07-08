const localApiBaseUrl = 'http://localhost:8080/api/v1';
const deployedApiBaseUrl = '';
const isBrowser = typeof window !== 'undefined';
const isLocalHost = isBrowser && ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const environment = {
  production: !isLocalHost,
  apiBaseUrl: isLocalHost ? localApiBaseUrl : deployedApiBaseUrl,
  localApiBaseUrl,
  deployedApiBaseUrl,
  appBaseUrl: isBrowser ? window.location.origin : 'http://localhost:4200',
};
