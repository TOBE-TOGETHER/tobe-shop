# TobeShop Client

This is the front-end application for the TobeShop e-commerce platform.

## Overview

The TobeShop client is built with React and Material-UI, providing a modern and responsive user interface for both buyers and sellers.

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dynamic Theming**: Futuristic and visually appealing UI
- **Internationalization**: Support for multiple languages
- **Role-based Access Control**: Different interfaces for buyers and sellers

## Getting Started

### Prerequisites

- Node.js 14+ and npm/yarn

### Installation

```bash
cd tobe-shop/client
npm install
npm start
```

The frontend development server will run on http://localhost:3000

## API Configuration

The client application can be easily configured to work with different API endpoints without code changes. This is useful for:

- Switching between development, staging, and production environments
- Testing with different backend instances
- Running the frontend against a local backend on a custom port

### Configuration Options

There are several ways to configure the API endpoint:

1. **Environment Variables**:

   - Set `REACT_APP_API_BASE_URL` in your `.env` file
   - Example: `REACT_APP_API_BASE_URL=http://localhost:8090`
   - Automatically applied when the app starts

2. **UI Configuration**:

   - Use the API settings icon in the top navigation bar
   - Enter the new API base URL (including protocol and port)
   - Changes apply after page refresh

3. **LocalStorage**:
   - For advanced users, set the `api_base_url` key in localStorage
   - This will persist between browser sessions

### Default Configuration

The default API endpoints are:

- **Development**: `http://localhost:8080/api`
- **Test**: `http://localhost:8090/api`
- **Production**: `https://api.tobeshop.example.com/api`

The environment is determined by the `REACT_APP_ENV` environment variable, which defaults to `development`.

## Development

### Project Structure

- `src/config` - Configuration files
- `src/components` - Reusable UI components
- `src/contexts` - React contexts for global state
- `src/hooks` - Custom React hooks
- `src/pages` - Page components
- `src/utils` - Utility functions and API services
- `src/i18n` - Internationalization
- `src/assets` - Static assets

### API Utilities

The application includes utility functions for API communication in `src/utils/api.ts`. These utilities:

- Use centralized configuration for API endpoints
- Provide type-safe wrappers for fetch requests
- Handle authentication headers
- Process API responses and errors consistently

Example usage:

```typescript
import { apiGet, apiPost } from "../utils/api";

// GET request with authentication
const data = await apiGet<UserData>("users/123", token);

// POST request
const response = await apiPost<APIResponse>("products", productData, token);
```

## License

This project is for educational purposes only.
