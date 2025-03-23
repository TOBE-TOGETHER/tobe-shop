package models

import (
	"time"

	"gorm.io/gorm"
)

type Role string

const (
	Buyer  Role = "buyer"
	Seller Role = "seller"
	Admin  Role = "admin"
)

type User struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
	Username  string         `gorm:"size:100;not null;unique" json:"username"`
	Email     string         `gorm:"size:100;not null;unique" json:"email"`
	Password  string         `gorm:"size:100;not null" json:"-"`
	Role      Role           `gorm:"size:10;not null;default:buyer" json:"role"`
	FirstName string         `gorm:"size:100;not null" json:"firstName"`
	LastName  string         `gorm:"size:100;not null" json:"lastName"`
	Phone     string         `gorm:"size:20" json:"phone,omitempty"`
	Address   string         `gorm:"size:255" json:"address,omitempty"`
	Avatar    string         `gorm:"size:255" json:"avatar,omitempty"`
	Shop      *Shop          `json:"shop,omitempty"`
	ShopID    uint           `json:"shopId,omitempty"`
}
