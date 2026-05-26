const localApiBaseUrl = 'http://localhost:8080/api/v1';
const deployedApiBaseUrl = 'https://cohive-kbvw.onrender.com/api/v1';
const isBrowser = typeof window !== 'undefined';
const isLocalHost = isBrowser && ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const environment = {
  production: !isLocalHost,
  apiBaseUrl: isLocalHost ? localApiBaseUrl : deployedApiBaseUrl,
  localApiBaseUrl,
  deployedApiBaseUrl,
  clerkPublishableKey: 'pk_test_bG92ZWQtdHVydGxlLTE4LmNsZXJrLmFjY291bnRzLmRldiQ',
  appBaseUrl: isBrowser ? window.location.origin : 'http://localhost:4200',
};
