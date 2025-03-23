package main

import (
	"log"
	"os"
	"path/filepath"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// ProductStatus represents the availability status of a product
type ProductStatus string

const (
	Available   ProductStatus = "available"
	Unavailable ProductStatus = "unavailable"
	Archived    ProductStatus = "archived"
)

// User model with simplified fields
type User struct {
	gorm.Model
	Username  string `gorm:"size:50;not null;unique" json:"username"`
	Email     string `gorm:"size:100;not null;unique" json:"email"`
	Password  string `gorm:"size:100;not null" json:"-"`
	Role      string `gorm:"size:20;not null;default:buyer" json:"role"`
	FirstName string `gorm:"size:50" json:"firstName"`
	LastName  string `gorm:"size:50" json:"lastName"`
	ShopID    uint   `json:"shopId,omitempty"`
}

// Shop model with simplified fields
type Shop struct {
	gorm.Model
	Name        string `gorm:"size:100;not null" json:"name"`
	Description string `gorm:"size:500" json:"description"`
	Logo        string `gorm:"size:255" json:"logo"`
	Address     string `gorm:"size:255" json:"address"`
	UserID      uint   `json:"userId"`
}

// Product model with all required fields
type Product struct {
	gorm.Model
	Name        string        `gorm:"size:100;not null" json:"name"`
	Description string        `gorm:"size:500" json:"description"`
	Price       float64       `gorm:"not null" json:"price"`
	Stock       int           `gorm:"not null" json:"stock"`
	Image       string        `gorm:"size:255" json:"image"`
	Category    string        `gorm:"size:50" json:"category"`
	Status      ProductStatus `gorm:"size:20;not null" json:"status"`
	ShopID      uint          `json:"shopId"`
	CreatedAt   time.Time     `json:"createdAt"`
	UpdatedAt   time.Time     `json:"updatedAt"`
}

// Categories we'll use for our sample products
var categories = []string{
	"Electronics",
	"Clothing",
	"Home & Kitchen",
	"Books",
	"Toys & Games",
	"Beauty",
	"Sports",
	"Automotive",
	"Jewelry",
	"Other",
}

// Sample products data
var sampleProducts = []struct {
	Name        string
	Description string
	Price       float64
	Stock       int
	Image       string
	Category    string
	Status      ProductStatus
	ShopID      uint
}{
	{
		Name:        "Premium Smartphone",
		Description: "Latest smartphone with advanced camera and performance features. Includes a 6.7-inch OLED display, 5G capability, and all-day battery life.",
		Price:       999.99,
		Stock:       25,
		Image:       "https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=600",
		Category:    "Electronics",
		Status:      Available,
		ShopID:      1, // Tech Haven
	},
	{
		Name:        "Ultrabook Pro",
		Description: "Thin and powerful laptop for productivity. Features an Intel i7 processor, 16GB RAM, and 512GB SSD for fast performance in a slim package.",
		Price:       1499.99,
		Stock:       10,
		Image:       "https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=600",
		Category:    "Electronics",
		Status:      Available,
		ShopID:      1, // Tech Haven
	},
	{
		Name:        "Wireless Headphones",
		Description: "Premium sound quality with noise cancellation. Enjoy up to 30 hours of battery life and immersive sound experience with active noise cancellation.",
		Price:       299.99,
		Stock:       30,
		Image:       "https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=600",
		Category:    "Electronics",
		Status:      Available,
		ShopID:      1, // Tech Haven
	},
	{
		Name:        "Smart Watch",
		Description: "Track fitness and stay connected with notifications. Features heart rate monitoring, GPS, and water resistance up to 50 meters.",
		Price:       199.99,
		Stock:       15,
		Image:       "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=600",
		Category:    "Electronics",
		Status:      Available,
		ShopID:      1, // Tech Haven
	},
	{
		Name:        "Bluetooth Speaker",
		Description: "Portable and waterproof with excellent sound quality. Enjoy up to 12 hours of playtime and connect to any Bluetooth-enabled device.",
		Price:       79.99,
		Stock:       30,
		Image:       "https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?auto=compress&cs=tinysrgb&w=600",
		Category:    "Electronics",
		Status:      Available,
		ShopID:      1, // Tech Haven
	},
	{
		Name:        "Smart Home Hub",
		Description: "Control all your smart devices from one place. Compatible with Alexa, Google Assistant, and most smart home products.",
		Price:       129.99,
		Stock:       10,
		Image:       "https://images.pexels.com/photos/1034812/pexels-photo-1034812.jpeg?auto=compress&cs=tinysrgb&w=600",
		Category:    "Electronics",
		Status:      Available,
		ShopID:      1, // Tech Haven
	},
	{
		Name:        "Casual Cotton T-shirt",
		Description: "Comfortable and breathable 100% cotton t-shirt. Perfect for daily wear in any season.",
		Price:       24.99,
		Stock:       50,
		Image:       "https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg?auto=compress&cs=tinysrgb&w=600",
		Category:    "Clothing",
		Status:      Available,
		ShopID:      2, // Fashion Forward
	},
	{
		Name:        "Designer Jeans",
		Description: "Premium denim jeans with modern fit. These comfortable jeans feature durable materials and timeless style.",
		Price:       79.99,
		Stock:       35,
		Image:       "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=600",
		Category:    "Clothing",
		Status:      Available,
		ShopID:      2, // Fashion Forward
	},
	{
		Name:        "Leather Jacket",
		Description: "Classic style with modern details. This genuine leather jacket features a comfortable fit and durable construction.",
		Price:       199.99,
		Stock:       20,
		Image:       "https://images.pexels.com/photos/16170/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600",
		Category:    "Clothing",
		Status:      Available,
		ShopID:      2, // Fashion Forward
	},
	{
		Name:        "Winter Scarf",
		Description: "Soft and warm for cold weather. Made with premium materials for comfort and style during winter months.",
		Price:       29.99,
		Stock:       45,
		Image:       "https://images.pexels.com/photos/45252/holiday-shopping-shopping-escalator-london-45252.jpeg?auto=compress&cs=tinysrgb&w=600",
		Category:    "Clothing",
		Status:      Available,
		ShopID:      2, // Fashion Forward
	},
	{
		Name:        "Stainless Steel Cookware Set",
		Description: "10-piece premium cookware for any kitchen. Made with high-quality stainless steel, these pots and pans are dishwasher safe and built to last.",
		Price:       149.99,
		Stock:       8,
		Image:       "https://images.pexels.com/photos/129731/pexels-photo-129731.jpeg?auto=compress&cs=tinysrgb&w=600",
		Category:    "Home & Kitchen",
		Status:      Available,
		ShopID:      3, // Home Essentials
	},
	{
		Name:        "Luxury Bedding Set",
		Description: "Premium cotton sheets and pillowcases. This set includes a fitted sheet, flat sheet, and two pillowcases in 100% Egyptian cotton.",
		Price:       89.99,
		Stock:       15,
		Image:       "https://images.pexels.com/photos/1329711/pexels-photo-1329711.jpeg?auto=compress&cs=tinysrgb&w=600",
		Category:    "Home & Kitchen",
		Status:      Available,
		ShopID:      3, // Home Essentials
	},
	{
		Name:        "Modern Coffee Table",
		Description: "Sleek design with storage space. This contemporary coffee table features clean lines and hidden compartments for storage.",
		Price:       199.99,
		Stock:       5,
		Image:       "https://images.pexels.com/photos/6580227/pexels-photo-6580227.jpeg?auto=compress&cs=tinysrgb&w=600",
		Category:    "Home & Kitchen",
		Status:      Available,
		ShopID:      3, // Home Essentials
	},
	{
		Name:        "Decorative Throw Pillows",
		Description: "Set of 4 pillows in complementary designs. Add a touch of style to your living room or bedroom with these coordinated throw pillows.",
		Price:       49.99,
		Stock:       25,
		Image:       "https://images.pexels.com/photos/6899545/pexels-photo-6899545.jpeg?auto=compress&cs=tinysrgb&w=600",
		Category:    "Home & Kitchen",
		Status:      Available,
		ShopID:      3, // Home Essentials
	},
	{
		Name:        "Ceramic Dinner Set",
		Description: "Service for 6 with modern design. This complete dinner set includes plates, bowls, and mugs in a contemporary style.",
		Price:       129.99,
		Stock:       10,
		Image:       "https://images.pexels.com/photos/6207730/pexels-photo-6207730.jpeg?auto=compress&cs=tinysrgb&w=600",
		Category:    "Home & Kitchen",
		Status:      Available,
		ShopID:      3, // Home Essentials
	},
}

func createSampleShopsIfNeeded(db *gorm.DB) {
	// Define some sample shops if they don't already exist
	shops := []Shop{
		{
			Model:       gorm.Model{ID: 1},
			Name:        "Tech Haven",
			Description: "Your one-stop shop for all tech gadgets.",
			Logo:        "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=600",
			Address:     "123 Tech Street, Silicon Valley, CA",
			UserID:      1, // Matching user ID 1
		},
		{
			Model:       gorm.Model{ID: 2},
			Name:        "Fashion Forward",
			Description: "Trendy clothing for all occasions.",
			Logo:        "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=600",
			Address:     "456 Fashion Ave, New York, NY",
			UserID:      2, // Matching user ID 2
		},
		{
			Model:       gorm.Model{ID: 3},
			Name:        "Home Essentials",
			Description: "Everything you need for a comfortable home.",
			Logo:        "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600",
			Address:     "789 Home Blvd, Chicago, IL",
			UserID:      3, // Matching user ID 3
		},
	}

	// Create sample users if they don't exist
	users := []User{
		{Model: gorm.Model{ID: 1}, Username: "techshop", Email: "tech@example.com", Password: "password", Role: "seller", FirstName: "Tech", LastName: "Shop", ShopID: 1},
		{Model: gorm.Model{ID: 2}, Username: "fashionstore", Email: "fashion@example.com", Password: "password", Role: "seller", FirstName: "Fashion", LastName: "Store", ShopID: 2},
		{Model: gorm.Model{ID: 3}, Username: "homestore", Email: "home@example.com", Password: "password", Role: "seller", FirstName: "Home", LastName: "Store", ShopID: 3},
	}

	// Create users
	for _, user := range users {
		var count int64
		db.Model(&User{}).Where("id = ?", user.ID).Count(&count)
		if count == 0 {
			db.Create(&user)
		} else {
			// Update existing user to ensure correct ShopID
			db.Model(&User{}).Where("id = ?", user.ID).Updates(map[string]interface{}{"shop_id": user.ShopID})
		}
	}

	// Create shops
	for _, shop := range shops {
		var count int64
		db.Model(&Shop{}).Where("id = ?", shop.ID).Count(&count)
		if count == 0 {
			db.Create(&shop)
		} else {
			// Update existing shop to ensure correct UserID
			db.Model(&Shop{}).Where("id = ?", shop.ID).Updates(map[string]interface{}{"user_id": shop.UserID})
		}
	}
}

func main() {
	// Get the current directory
	dir, err := os.Getwd()
	if err != nil {
		log.Fatalf("Failed to get current directory: %v", err)
	}
	log.Printf("Current directory: %s", dir)

	// Get the database path (relative to the project root)
	dbPath := filepath.Join("..", "tobe_shop.db")
	log.Printf("Database path: %s", dbPath)

	// Connect to the SQLite database
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Connected to database successfully")

	// Auto migrate the schema
	db.AutoMigrate(&User{}, &Shop{}, &Product{})

	// Create sample shops if they don't exist
	createSampleShopsIfNeeded(db)

	// Count existing products
	var count int64
	db.Model(&Product{}).Count(&count)
	log.Printf("Current product count: %d", count)

	// Only seed if there are no products
	if count == 0 {
		log.Println("Seeding product data...")
		for _, p := range sampleProducts {
			product := Product{
				Name:        p.Name,
				Description: p.Description,
				Price:       p.Price,
				Stock:       p.Stock,
				Image:       p.Image,
				Category:    p.Category,
				Status:      p.Status,
				ShopID:      p.ShopID,
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			}

			result := db.Create(&product)
			if result.Error != nil {
				log.Printf("Error creating product %s: %v", p.Name, result.Error)
			} else {
				log.Printf("Created product: %s", p.Name)
			}
		}
		log.Println("Product seeding completed successfully")
	} else {
		log.Println("Database already has products, skipping seed")
	}
}
