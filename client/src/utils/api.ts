import { getApiUrl } from '../config/apiConfig';

/**
 * Creates request headers with optional authorization token
 * @param token - Optional authentication token
 * @returns Headers object with proper content type and authorization
 */
const createHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Makes an API request with proper error handling
 * @param endpoint - API endpoint (without the base URL)
 * @param options - Fetch options
 * @returns Promise with the response data
 */
const apiRequest = async <T>(endpoint: string, options: RequestInit): Promise<T> => {
  const response = await fetch(getApiUrl(endpoint), options);

  if (!response.ok) {
    throw createApiError(response);
  }

  return await response.json();
};

/**
 * Makes a GET request to the API
 * @param endpoint - API endpoint (without the base URL)
 * @param token - Optional authentication token
 * @returns Promise with the response data
 */
export const apiGet = async <T>(endpoint: string, token?: string): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'GET',
    headers: createHeaders(token),
  });
};

/**
 * Makes a POST request to the API
 * @param endpoint - API endpoint (without the base URL)
 * @param data - Request body data
 * @param token - Optional authentication token
 * @returns Promise with the response data
 */
export const apiPost = async <T>(endpoint: string, data: any, token?: string): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    headers: createHeaders(token),
    body: JSON.stringify(data),
  });
};

/**
 * Makes a PUT request to the API
 * @param endpoint - API endpoint (without the base URL)
 * @param data - Request body data
 * @param token - Optional authentication token
 * @returns Promise with the response data
 */
export const apiPut = async <T>(endpoint: string, data: any, token?: string): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    headers: createHeaders(token),
    body: JSON.stringify(data),
  });
};

/**
 * Makes a DELETE request to the API
 * @param endpoint - API endpoint (without the base URL)
 * @param token - Optional authentication token
 * @returns Promise with the response data
 */
export const apiDelete = async <T>(endpoint: string, token?: string): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
    headers: createHeaders(token),
  });
};

/**
 * Creates an API error from a response
 * @param response - Fetch Response object
 * @returns Error with details from the response
 */
const createApiError = (response: Response): Error => {
  const error = new Error(`API Error: ${response.status} ${response.statusText}`);
  (error as any).status = response.status;
  (error as any).statusText = response.statusText;
  return error;
};

/**
 * Parses the response as text, handling cases where the response is empty
 * @param response - Fetch Response object
 * @returns Promise with the text response or an empty string
 */
export const getResponseText = async (response: Response): Promise<string> => {
  try {
    return await response.text();
  } catch (e) {
    return '';
  }
}; 