#!/bin/bash

# Navigate to the script directory
cd "$(dirname "$0")"

echo "Running product seeding script..."

# Compile and run the Go script
go run seed_products.go

echo "Done!" 