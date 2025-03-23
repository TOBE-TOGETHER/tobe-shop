package models

import (
	"time"

	"gorm.io/gorm"
)

type OrderStatus string

const (
	Pending   OrderStatus = "pending"
	Paid      OrderStatus = "paid"
	Shipped   OrderStatus = "shipped"
	Delivered OrderStatus = "delivered"
	Cancelled OrderStatus = "cancelled"
)

type Order struct {
	gorm.Model
	UserID          uint        `json:"userId"`
	User            *User       `json:"user,omitempty"`
	OrderItems      []OrderItem `json:"orderItems"`
	Total           float64     `gorm:"not null" json:"total"`
	Status          OrderStatus `gorm:"size:20;not null" json:"status"`
	PaymentID       string      `gorm:"size:100" json:"paymentId"`
	ShippingAddress string      `gorm:"size:255" json:"shippingAddress"`
	BillingAddress  string      `gorm:"size:255" json:"billingAddress"`
	InvoiceID       uint        `json:"invoiceId"`
	Invoice         *Invoice    `json:"invoice,omitempty"`
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

type OrderItem struct {
	gorm.Model
	OrderID    uint     `json:"orderId"`
	ProductID  uint     `json:"productId"`
	Product    *Product `json:"product,omitempty"`
	Quantity   int      `gorm:"not null" json:"quantity"`
	Price      float64  `gorm:"not null" json:"price"`
	TotalPrice float64  `gorm:"not null" json:"totalPrice"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
}
