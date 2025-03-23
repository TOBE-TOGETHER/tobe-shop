package models

import (
	"time"

	"gorm.io/gorm"
)

type InvoiceStatus string

const (
	Unpaid        InvoiceStatus = "unpaid"
	PartiallyPaid InvoiceStatus = "partially_paid"
	FullyPaid     InvoiceStatus = "fully_paid"
	Void          InvoiceStatus = "void"
)

type Invoice struct {
	gorm.Model
	OrderID     uint          `json:"orderId"`
	Order       *Order        `json:"order,omitempty"`
	Amount      float64       `gorm:"not null" json:"amount"`
	Tax         float64       `gorm:"not null" json:"tax"`
	TotalAmount float64       `gorm:"not null" json:"totalAmount"`
	Status      InvoiceStatus `gorm:"size:20;not null" json:"status"`
	DueDate     time.Time     `json:"dueDate"`
	IssueDate   time.Time     `json:"issueDate"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
