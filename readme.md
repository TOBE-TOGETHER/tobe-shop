## TobeShop

This is a shopping website project for study purposes, developed with the assistance of Cursor + MCP servers.

## Technical Stack

- **Server-end**: Golang + Gin
- **Front-end**: React + Material-UI
- **Database**: SQLite (can be easily migrated to MySQL/PostgreSQL for production)

## Features

There are two types of users using this website:

- **Buyers**: Can view all products and shops without login and place orders online. Payments are processed through Alipay (third-party payment gateway).
- **Sellers/Merchants**: Need to register an account to manage their shops, products, orders, and invoices.

The website supports both Chinese and English languages.

## Main Pages & Functions

### Buyer Pages

- **Home page**: Displays popular products, recommended products, and featured shops
- **Product listing page**: Browse all available products with filtering and sorting options
- **Product details page**: Detailed view of a product with specifications and purchasing options
- **Shopping cart page**: Manage selected items before checkout
- **Checkout page**: Complete the purchase with shipping and payment information
- **Order tracking page**: Track the status of placed orders

### Authentication

- **Sign up page**: Register as a new buyer or seller
- **Login page**: Authentication for registered users

### Seller Management Pages

- **Product Management**
  - Product list page: View, edit, and manage all products
  - Product details page: View detailed product information
  - Product creation page: Add new products to the store
- **Order Management**
  - Order list page: View and manage all incoming orders
  - Order detail page: Process specific orders, update status
- **Invoice Management**
  - Invoice list page: View all financial transactions
  - Invoice details page: View detailed invoice information

## Getting Started

### Prerequisites

- Go 1.16+ for backend
- Node.js 14+ and npm/yarn for frontend
- Docker and Docker Compose (for containerized setup)

### Installation

#### Traditional Setup

##### Backend Setup

```bash
cd tobe_shop/server
go mod tidy
go run main.go
```

The backend server will run on http://localhost:8080

##### Frontend Setup

```bash
cd tobe_shop/client
npm install
npm start
```

The frontend development server will run on http://localhost:3000

#### Docker Setup

You can use Docker to run both the frontend and backend together:

1. Make sure Docker and Docker Compose are installed on your system
2. From the project root, run:

```bash
docker-compose up -d
```

This will:

- Build and start the backend on port 8080
- Build and start the frontend on port 80

To access the application, open http://localhost in your browser.

To stop the containers:

```bash
docker-compose down
```

### Development

If you want to rebuild the containers after making changes:

```bash
docker-compose up -d --build
```

## License

This project is for educational purposes only.
