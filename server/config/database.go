package config

import (
	"log"
	"tobe_shop/server/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// ConnectDatabase initializes database connection
func ConnectDatabase() {
	database, err := gorm.Open(sqlite.Open("tobe_shop.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Connected to database successfully")

	// Auto Migrate the models
	err = database.AutoMigrate(
		&models.User{},
		&models.Shop{},
		&models.Product{},
		&models.Order{},
		&models.OrderItem{},
		&models.Invoice{},
	)

	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database migrated successfully")

	DB = database
}

// GetDB returns the database connection
func GetDB() *gorm.DB {
	return DB
}
