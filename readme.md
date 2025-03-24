## TobeShop

This is a shopping website project for study purposes, developed with the assistance of Cursor + MCP servers, no one-line manual code.

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

## License

This project is for educational purposes only.

## Screenshots
![TobeShop _ Next-Gen Shopping](https://github.com/user-attachments/assets/5e294242-919a-493d-81fd-5674fbfb4665)
![TobeShop _ Next-Gen Shopping (7)](https://github.com/user-attachments/assets/60e630e1-e1f2-4153-8d94-26bfb6b2853f)
![TobeShop _ Next-Gen Shopping (6)](https://github.com/user-attachments/assets/88accef4-d3d1-40c5-9d06-3c76a975218a)
![TobeShop _ Next-Gen Shopping (4)](https://github.com/user-attachments/assets/e2fab7fc-f559-44fe-86b1-49b1d5c03b47)
![TobeShop _ Next-Gen Shopping (2)](https://github.com/user-attachments/assets/cd1842c4-f1e9-497e-9bdd-e2efc46b5498)
![TobeShop _ Next-Gen Shopping (1)](https://github.com/user-attachments/assets/d4ab24fb-b87b-44e2-933c-0734247d5e92)

