package models

import (
	"time"

	"gorm.io/gorm"
)

type ProductStatus string

const (
	Available   ProductStatus = "available"
	Unavailable ProductStatus = "unavailable"
	Archived    ProductStatus = "archived"
)

type Product struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
	Name        string         `gorm:"size:100;not null" json:"name"`
	Description string         `gorm:"size:500" json:"description"`
	Price       float64        `gorm:"not null" json:"price"`
	Stock       int            `gorm:"not null" json:"stock"`
	Image       string         `gorm:"size:255" json:"image"`   // Single main image URL
	Category    string         `gorm:"size:50" json:"category"` // Product category
	Status      ProductStatus  `gorm:"size:20;not null" json:"status"`
	ShopID      uint           `json:"shopId"`
	Shop        *Shop          `json:"shop,omitempty"`
	OrderItems  []*OrderItem   `json:"orderItems,omitempty"`
}
