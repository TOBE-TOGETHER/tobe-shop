import { getApiUrl, getBaseUrl, overrideApiBaseUrl, setEnvironment } from '../../config/apiConfig';

describe('API Configuration', () => {
  const originalEnv = process.env;
  
  // Save original environment variables
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });
  
  // Restore original environment variables
  afterEach(() => {
    process.env = originalEnv;
  });
  
  test('getApiUrl combines base URL and endpoint correctly', () => {
    // Without leading slash
    expect(getApiUrl('users')).toMatch(/\/api\/users$/);
    
    // With leading slash
    expect(getApiUrl('/users')).toMatch(/\/api\/users$/);
    
    // With trailing slash in baseUrl (handled by config)
    expect(getApiUrl('users')).not.toMatch(/\/\/$/);
  });
  
  test('overrideApiBaseUrl changes the base URL', () => {
    const originalBaseUrl = getBaseUrl();
    const newBaseUrl = 'http://localhost:9000';
    
    overrideApiBaseUrl(newBaseUrl);
    
    expect(getBaseUrl()).toBe(newBaseUrl);
    expect(getApiUrl('test')).toBe(`${newBaseUrl}/api/test`);
    
    // Reset to original for subsequent tests
    overrideApiBaseUrl(originalBaseUrl);
  });
  
  test('setEnvironment changes the environment configuration', () => {
    const originalBaseUrl = getBaseUrl();
    
    // Change to test environment
    setEnvironment('test');
    expect(getBaseUrl()).toMatch(/8090/);
    
    // Change to production environment
    setEnvironment('production');
    expect(getBaseUrl()).toMatch(/tobeshop\.example\.com/);
    
    // Change to an invalid environment (should default to development)
    setEnvironment('invalid');
    expect(getBaseUrl()).toMatch(/8080/);
    
    // Reset to original for subsequent tests
    overrideApiBaseUrl(originalBaseUrl);
  });
}); 