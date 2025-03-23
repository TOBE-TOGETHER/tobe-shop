// API Configuration

interface ApiConfig {
  apiBaseUrl: string;
  apiVersion: string;
}

// Default environment to use if none is specified
const currentEnv = process.env.REACT_APP_ENV || 'development';

// Configuration for different environments
const configs: Record<string, ApiConfig> = {
  development: {
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
    apiVersion: 'api'
  },
  test: {
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8090',
    apiVersion: 'api'
  },
  production: {
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'https://api.tobeshop.example.com',
    apiVersion: 'api'
  }
};

// Get the config for the current environment or fall back to development
const config = configs[currentEnv] || configs.development;

// Helper functions
export const getApiUrl = (endpoint: string): string => {
  return `${config.apiBaseUrl}/${config.apiVersion}/${endpoint.replace(/^\/+/, '')}`;
};

export const getBaseUrl = (): string => {
  return config.apiBaseUrl;
};

export const getApiVersion = (): string => {
  return config.apiVersion;
};

export default config; 