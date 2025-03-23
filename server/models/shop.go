package models

import (
	"time"

	"gorm.io/gorm"
)

type Shop struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
	Name        string         `gorm:"size:100;not null" json:"name"`
	Description string         `gorm:"size:500" json:"description"`
	Logo        string         `gorm:"size:255" json:"logo"`
	Address     string         `gorm:"size:255" json:"address"`
	UserID      uint           `json:"userId"`
	Products    []*Product     `json:"products,omitempty"`
}
