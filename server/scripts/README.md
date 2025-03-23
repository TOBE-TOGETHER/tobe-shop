# Database Seeding Scripts

This directory contains scripts for initializing the database with sample data.

## Product Seeding Script

The `seed_products.go` script creates sample products, shops, and users in the database. This is useful for development and testing purposes.

### How to Use

You can run the script in one of two ways:

1. Using the shell script (recommended):

   ```
   ./seed_db.sh
   ```

2. Directly with Go:
   ```
   cd server/scripts
   go run seed_products.go
   ```

### What It Does

The script:

1. Connects to the SQLite database
2. Creates sample users if they don't exist
3. Creates sample shops if they don't exist
4. Creates sample products if no products exist in the database

### Note

- The script only adds data if the database is empty (no products exist)
- Each sample product includes an image URL, category, and is associated with a shop
- The script automatically creates the necessary shop and user records for the products

## Sample Data

The seeding script includes a variety of products across multiple categories:

- Electronics (smartphones, laptops, headphones)
- Clothing (t-shirts, jeans)
- Home & Kitchen (cookware)
- Books
- Toys & Games
- Beauty products
- Sports equipment
- Automotive accessories
- Jewelry

Each product is associated with a specific shop and includes detailed information such as name, description, price, stock level, image URL, and status.
