package main

import (
	"bytes"
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"
	"tobe_shop/server/config"
	"tobe_shop/server/middleware"
	"tobe_shop/server/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var db *gorm.DB

func main() {
	// Parse command line flags
	port := flag.String("port", "8080", "Port to run the server on")
	flag.Parse()

	// Initialize database
	config.ConnectDatabase()

	// Set up Gin
	r := gin.Default()

	// Setup CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// API routes
	api := r.Group("/api")
	{
		// Add debug log
		log.Println("Registering API routes...")

		// Auth routes
		api.POST("/register", registerUser)
		api.POST("/login", loginUser)

		// Product routes
		api.GET("/products", getProducts)
		api.GET("/products/:id", getProduct)
		api.POST("/products", middleware.AuthMiddleware(), createProduct)
		api.PUT("/products/:id", middleware.AuthMiddleware(), updateProduct)
		api.DELETE("/products/:id", middleware.AuthMiddleware(), deleteProduct)

		// Shop routes
		log.Println("Registering shop routes...")
		api.GET("/shops", getShops)
		api.GET("/shops/:id", getShop)
		api.POST("/shops", middleware.AuthMiddleware(), createShop)
		api.PUT("/shops/:id", middleware.AuthMiddleware(), updateShop)
		api.GET("/users/:id/shops", middleware.AuthMiddleware(), getUserShops)
		log.Println("Shop routes registered!")

		// Order routes
		api.GET("/orders", getOrders)
		api.GET("/orders/:id", getOrder)
		api.POST("/orders", createOrder)
		api.PUT("/orders/:id", updateOrder)

		// Invoice routes
		api.GET("/invoices", getInvoices)
		api.GET("/invoices/:id", getInvoice)

		// User routes
		api.GET("/users/:id", middleware.AuthMiddleware(), getUser)
		api.PUT("/users/:id", middleware.AuthMiddleware(), updateUser)
		api.PUT("/users/:id/avatar", middleware.AuthMiddleware(), updateUserAvatar)

		// Simple health check endpoint
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status": "ok",
			})
		})
	}

	// Start the server
	serverAddr := ":" + *port
	log.Println("Server starting on http://localhost" + serverAddr)
	if err := r.Run(serverAddr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// Auth handlers
func registerUser(c *gin.Context) {
	// Debug message
	log.Println("DEBUG: registerUser function called")

	// Log the raw request body
	bodyBytes, _ := c.GetRawData()
	log.Printf("DEBUG: Raw request body: %s\n", string(bodyBytes))

	// Reset the request body for later binding
	c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	// Parse the raw JSON first to inspect fields
	var rawData map[string]interface{}
	if err := c.ShouldBindJSON(&rawData); err != nil {
		log.Printf("DEBUG: Error binding JSON: %s\n", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format: " + err.Error()})
		return
	}

	// Debug the raw data
	log.Printf("DEBUG: Raw registration data: %+v\n", rawData)

	// Log each field individually to see what's happening
	log.Printf("DEBUG: username = %v (type: %T)\n", rawData["username"], rawData["username"])
	log.Printf("DEBUG: email = %v (type: %T)\n", rawData["email"], rawData["email"])
	log.Printf("DEBUG: password = %v (type: %T)\n", rawData["password"], rawData["password"])
	log.Printf("DEBUG: firstName = %v (type: %T)\n", rawData["firstName"], rawData["firstName"])
	log.Printf("DEBUG: lastName = %v (type: %T)\n", rawData["lastName"], rawData["lastName"])
	log.Printf("DEBUG: role = %v (type: %T)\n", rawData["role"], rawData["role"])

	// Check for required fields in the raw data
	requiredFields := []string{"username", "email", "password", "firstName", "lastName"}
	missingFields := []string{}

	for _, field := range requiredFields {
		if value, exists := rawData[field]; !exists {
			log.Printf("DEBUG: Field %s does not exist\n", field)
			missingFields = append(missingFields, field)
		} else if value == "" {
			log.Printf("DEBUG: Field %s is empty\n", field)
			missingFields = append(missingFields, field)
		} else {
			log.Printf("DEBUG: Field %s is valid: %v\n", field, value)
		}
	}

	if len(missingFields) > 0 {
		log.Printf("DEBUG: Missing fields: %v\n", missingFields)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing required fields: " + strings.Join(missingFields, ", "),
		})
		return
	}

	// Now bind to our struct
	var user models.User
	if username, ok := rawData["username"].(string); ok {
		user.Username = username
		log.Printf("DEBUG: Set username to: %s\n", user.Username)
	}
	if email, ok := rawData["email"].(string); ok {
		user.Email = email
		log.Printf("DEBUG: Set email to: %s\n", user.Email)
	}
	if password, ok := rawData["password"].(string); ok {
		user.Password = password
		log.Printf("DEBUG: Set password (length: %d)\n", len(user.Password))
	}
	if firstName, ok := rawData["firstName"].(string); ok {
		user.FirstName = firstName
		log.Printf("DEBUG: Set firstName to: %s\n", user.FirstName)
	}
	if lastName, ok := rawData["lastName"].(string); ok {
		user.LastName = lastName
		log.Printf("DEBUG: Set lastName to: %s\n", user.LastName)
	}

	// Set role if provided, otherwise default to buyer
	if role, exists := rawData["role"]; exists && role != "" {
		if roleStr, ok := role.(string); ok {
			user.Role = models.Role(roleStr)
			log.Printf("DEBUG: Set role to: %s\n", user.Role)
		} else {
			user.Role = models.Buyer
			log.Printf("DEBUG: Setting default role: %s\n", user.Role)
		}
	} else {
		user.Role = models.Buyer
		log.Printf("DEBUG: Setting default role: %s\n", user.Role)
	}

	// Set optional fields if provided
	if phone, exists := rawData["phone"]; exists && phone != "" {
		if phoneStr, ok := phone.(string); ok {
			user.Phone = phoneStr
			log.Printf("DEBUG: Set phone to: %s\n", user.Phone)
		}
	}
	if address, exists := rawData["address"]; exists && address != "" {
		if addressStr, ok := address.(string); ok {
			user.Address = addressStr
			log.Printf("DEBUG: Set address to: %s\n", user.Address)
		}
	}
	if avatar, exists := rawData["avatar"]; exists && avatar != "" {
		if avatarStr, ok := avatar.(string); ok {
			user.Avatar = avatarStr
			log.Printf("DEBUG: Set avatar (length: %d)\n", len(user.Avatar))
		}
	}

	// Debug the processed user object
	log.Printf("DEBUG: Processed user object: %+v\n", user)

	// Validate required fields in the user struct
	if user.Username == "" || user.Email == "" || user.Password == "" ||
		user.FirstName == "" || user.LastName == "" {
		log.Println("DEBUG: Validation failed on required fields")
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Username, email, password, first name and last name are required",
		})
		return
	}

	// Additional validation
	if len(user.Password) < 6 {
		log.Println("DEBUG: Password length validation failed")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password must be at least 6 characters long"})
		return
	}

	if !strings.Contains(user.Email, "@") {
		log.Println("DEBUG: Email format validation failed")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("DEBUG: Password hashing failed: %s\n", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	user.Password = string(hashedPassword)
	log.Println("DEBUG: Password hashed successfully")

	// Save user to database
	result := config.DB.Create(&user)
	if result.Error != nil {
		log.Printf("DEBUG: Database error: %s\n", result.Error.Error())
		// Check for duplicate key errors
		if strings.Contains(result.Error.Error(), "UNIQUE constraint failed") {
			if strings.Contains(result.Error.Error(), "username") {
				c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
			} else if strings.Contains(result.Error.Error(), "email") {
				c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
			} else {
				c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user: " + result.Error.Error()})
		}
		return
	}
	log.Printf("DEBUG: User created successfully with ID %d\n", user.ID)

	// Hide password in the response
	user.Password = ""

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user":    user,
	})
}

func loginUser(c *gin.Context) {
	var loginData struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Trim whitespace from inputs
	loginData.Email = strings.TrimSpace(loginData.Email)
	loginData.Password = strings.TrimSpace(loginData.Password)

	// Validate input
	if loginData.Email == "" || loginData.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email and password are required"})
		return
	}

	// Find user by email
	var user models.User
	result := config.DB.Where("email = ?", loginData.Email).First(&user)
	if result.Error != nil {
		// Don't reveal if the email exists or not for security reasons
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Compare passwords
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginData.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Optionally load any relationships if needed
	// For example, if the user is a seller, you might want to load their shop
	if user.Role == models.Seller {
		config.DB.Model(&user).Association("Shop").Find(&user.Shop)
	}

	// Create a simple token (in a real app, use JWT)
	token := fmt.Sprintf("%d_%s_%d", user.ID, user.Username, time.Now().Unix())

	// Don't send password to client
	user.Password = ""

	// Return user data and token
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   token,
		"user":    user,
	})
}

// Product handlers
func getProducts(c *gin.Context) {
	var products []models.Product
	var count int64

	// Initialize query builder
	query := config.DB

	// Check if shopId filter is provided
	shopId := c.Query("shopId")
	if shopId != "" {
		query = query.Where("shop_id = ?", shopId)
	}

	// Check if status filter is provided
	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	// Check if category filter is provided
	category := c.Query("category")
	if category != "" {
		query = query.Where("category = ?", category)
	}

	// Check if search term is provided
	search := c.Query("search")
	if search != "" {
		// Search in name and description
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Count total products matching filters (before pagination)
	if err := query.Model(&models.Product{}).Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count products"})
		return
	}

	// Parse pagination params
	page := 1
	limit := 18 // Default items per page

	pageParam := c.Query("page")
	if pageParam != "" {
		if pageInt, err := strconv.Atoi(pageParam); err == nil && pageInt > 0 {
			page = pageInt
		}
	}

	limitParam := c.Query("limit")
	if limitParam != "" {
		if limitInt, err := strconv.Atoi(limitParam); err == nil && limitInt > 0 {
			limit = limitInt
		}
	}

	// Handle sorting
	sort := c.Query("sort")
	switch sort {
	case "priceLow":
		query = query.Order("price asc")
	case "priceHigh":
		query = query.Order("price desc")
	case "name":
		query = query.Order("name asc")
	case "newest":
		query = query.Order("created_at desc")
	default:
		// Default sort by ID (featured)
		query = query.Order("id asc")
	}

	// Calculate offset
	offset := (page - 1) * limit

	// Add pagination to query
	query = query.Offset(offset).Limit(limit)

	// Execute the query with all filters and pagination
	if err := query.Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	// Calculate total pages
	totalPages := int(math.Ceil(float64(count) / float64(limit)))

	c.JSON(http.StatusOK, gin.H{
		"products": products,
		"pagination": gin.H{
			"totalProducts": count,
			"totalPages":    totalPages,
			"currentPage":   page,
			"limit":         limit,
		},
	})
}

func getProduct(c *gin.Context) {
	id := c.Param("id")
	var product models.Product

	if err := config.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"product": product})
}

func createProduct(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get user info to check if seller
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user information"})
		return
	}

	// Only sellers can create products
	if user.Role != models.Seller {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only sellers can create products"})
		return
	}

	// Parse the JSON request body
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log received data for debugging
	log.Printf("Received product data: %+v", product)

	// Check if a shop ID is provided in the request
	if product.ShopID == 0 {
		// If not provided, check if user has a shop
		if user.ShopID == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "You need to create a shop first"})
			return
		}
		// Use the user's shop ID if product doesn't specify one
		product.ShopID = user.ShopID
	} else {
		// If product contains a shopId, verify that the shop exists
		var shop models.Shop
		if err := config.DB.First(&shop, product.ShopID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shop ID"})
			return
		}

		// Ensure the user owns this shop
		if shop.UserID != user.ID {
			log.Printf("User ID: %d, Shop UserID: %d", user.ID, shop.UserID)
			c.JSON(http.StatusForbidden, gin.H{"error": "You can only create products for your own shop"})
			return
		}
	}

	// Set default status if not provided
	if product.Status == "" {
		product.Status = models.Available
	}

	// Save to database
	if err := config.DB.Create(&product).Error; err != nil {
		log.Printf("Error creating product: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"product": product})
}

func updateProduct(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get product ID from URL
	id := c.Param("id")
	var product models.Product

	// Get the existing product
	if err := config.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// Get user info
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user information"})
		return
	}

	// Get shop info for the product
	var shop models.Shop
	if err := config.DB.First(&shop, product.ShopID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get shop information"})
		return
	}

	// Verify user owns the shop that owns this product
	if shop.UserID != user.ID {
		log.Printf("User ID: %d, Shop UserID: %d, Product ShopID: %d", user.ID, shop.UserID, product.ShopID)
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update products from your own shop"})
		return
	}

	// Parse the JSON request body for updated fields
	var updatedProduct models.Product
	if err := c.ShouldBindJSON(&updatedProduct); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields while preserving ShopID
	shopID := product.ShopID
	updatedProduct.ShopID = shopID

	// Update in database (only specified fields)
	if err := config.DB.Model(&product).Updates(updatedProduct).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	// Get updated product from DB
	config.DB.First(&product, id)

	c.JSON(http.StatusOK, gin.H{"product": product})
}

func deleteProduct(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get product ID from URL
	id := c.Param("id")
	var product models.Product

	// Get the existing product
	if err := config.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// Get user info
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user information"})
		return
	}

	// Get shop info for the product
	var shop models.Shop
	if err := config.DB.First(&shop, product.ShopID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get shop information"})
		return
	}

	// Verify user owns the shop that owns this product
	if shop.UserID != user.ID {
		log.Printf("User ID: %d, Shop UserID: %d, Product ShopID: %d", user.ID, shop.UserID, product.ShopID)
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete products from your own shop"})
		return
	}

	// Delete from database (soft delete by default with GORM)
	if err := config.DB.Delete(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}

// Shop handlers
func getShops(c *gin.Context) {
	var shops []models.Shop

	if err := config.DB.Find(&shops).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch shops"})
		return
	}

	// For each shop, get the owner information and product count
	var shopsWithOwners []gin.H
	for _, shop := range shops {
		var owner models.User
		var productCount int64

		// Get product count for this shop
		if err := config.DB.Model(&models.Product{}).Where("shop_id = ?", shop.ID).Count(&productCount).Error; err != nil {
			// If error counting products, just set count to 0
			productCount = 0
		}

		if err := config.DB.Where("id = ?", shop.UserID).First(&owner).Error; err != nil {
			// If we can't find the owner, just continue with the shop data
			shopsWithOwners = append(shopsWithOwners, gin.H{
				"id":           shop.ID,
				"name":         shop.Name,
				"description":  shop.Description,
				"logo":         shop.Logo,
				"address":      shop.Address,
				"userId":       shop.UserID,
				"createdAt":    shop.CreatedAt,
				"updatedAt":    shop.UpdatedAt,
				"productCount": productCount,
			})
		} else {
			// Include owner details
			shopsWithOwners = append(shopsWithOwners, gin.H{
				"id":           shop.ID,
				"name":         shop.Name,
				"description":  shop.Description,
				"logo":         shop.Logo,
				"address":      shop.Address,
				"userId":       shop.UserID,
				"createdAt":    shop.CreatedAt,
				"updatedAt":    shop.UpdatedAt,
				"productCount": productCount,
				"owner": gin.H{
					"id":        owner.ID,
					"username":  owner.Username,
					"firstName": owner.FirstName,
					"lastName":  owner.LastName,
					"avatar":    owner.Avatar,
				},
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{"shops": shopsWithOwners})
}

// Get shops for a specific user
func getUserShops(c *gin.Context) {
	userID := c.Param("id")

	// Verify current user has permission to view this user's shops
	currentUserIDValue, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: userId not found in context"})
		return
	}

	currentUserID, ok := currentUserIDValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid userId format in context"})
		return
	}

	// Log the request details for debugging
	log.Printf("User %s requesting shops for user %s", currentUserID, userID)

	// Only allow users to see their own shops
	if currentUserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to view other users' shops"})
		return
	}

	var shops []models.Shop
	if err := config.DB.Where("user_id = ?", userID).Find(&shops).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user shops"})
		return
	}

	if len(shops) == 0 {
		c.JSON(http.StatusOK, gin.H{"shops": []interface{}{}})
		return
	}

	// Get the shop owner details
	var owner models.User
	if err := config.DB.First(&owner, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Shop owner not found"})
		return
	}

	// Format response
	var formattedShops []gin.H
	for _, shop := range shops {
		formattedShops = append(formattedShops, gin.H{
			"id":          shop.ID,
			"name":        shop.Name,
			"description": shop.Description,
			"logo":        shop.Logo,
			"address":     shop.Address,
			"userId":      shop.UserID,
			"createdAt":   shop.CreatedAt,
			"updatedAt":   shop.UpdatedAt,
			"owner": gin.H{
				"id":        owner.ID,
				"username":  owner.Username,
				"firstName": owner.FirstName,
				"lastName":  owner.LastName,
				"avatar":    owner.Avatar,
			},
		})
	}

	c.JSON(http.StatusOK, gin.H{"shops": formattedShops})
}

func getShop(c *gin.Context) {
	id := c.Param("id")
	var shop models.Shop

	if err := config.DB.First(&shop, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Shop not found"})
		return
	}

	// Get the owner information
	var owner models.User
	if err := config.DB.Where("id = ?", shop.UserID).First(&owner).Error; err == nil {
		c.JSON(http.StatusOK, gin.H{
			"shop": gin.H{
				"id":          shop.ID,
				"name":        shop.Name,
				"description": shop.Description,
				"logo":        shop.Logo,
				"address":     shop.Address,
				"userId":      shop.UserID,
				"createdAt":   shop.CreatedAt,
				"updatedAt":   shop.UpdatedAt,
				"owner": gin.H{
					"id":        owner.ID,
					"username":  owner.Username,
					"firstName": owner.FirstName,
					"lastName":  owner.LastName,
					"avatar":    owner.Avatar,
				},
			},
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"shop": shop,
		})
	}
}

func createShop(c *gin.Context) {
	log.Println("createShop endpoint hit!")

	// Get current user from token
	userIDValue, exists := c.Get("userId")
	log.Printf("userIDValue exists: %v, value: %v, type: %T", exists, userIDValue, userIDValue)

	// Convert userId from string to int
	userIDStr, ok := userIDValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid userId format in context"})
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse userId"})
		return
	}

	// Log the userId for debugging
	log.Printf("Creating shop for user ID: %d", userID)

	// Check if user exists
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
		return
	}

	// Check if user already has a shop
	var existingShop models.Shop
	if err := config.DB.Where("user_id = ?", userID).First(&existingShop).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User already has a shop"})
		return
	}

	// Bind the shop data from request
	var shopInput struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		Logo        string `json:"logo"`
		Address     string `json:"address"`
	}

	if err := c.ShouldBindJSON(&shopInput); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create shop with user ID
	shop := models.Shop{
		UserID:      user.ID,
		Name:        shopInput.Name,
		Description: shopInput.Description,
		Logo:        shopInput.Logo,
		Address:     shopInput.Address,
	}

	if err := config.DB.Create(&shop).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create shop"})
		return
	}

	// Update user's role to seller and add shopID if not already set
	if user.Role != "seller" {
		user.Role = "seller"
		user.ShopID = shop.ID
		if err := config.DB.Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user role"})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Shop created successfully",
		"shop":    shop,
	})
}

func updateShop(c *gin.Context) {
	// Get current user from token
	userIDValue, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: userId not found in context"})
		return
	}

	// Convert userId from string to int
	userIDStr, ok := userIDValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid userId format in context"})
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse userId"})
		return
	}

	// Log the userId for debugging
	log.Printf("Updating shop for user ID: %d", userID)

	// Get shop ID from URL
	shopID := c.Param("id")

	// Check if shop exists and belongs to the user
	var shop models.Shop
	if err := config.DB.First(&shop, shopID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Shop not found"})
		return
	}

	// Verify shop ownership
	if shop.UserID != uint(userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to update this shop"})
		return
	}

	// Bind the update data
	var shopInput struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Logo        string `json:"logo"`
		Address     string `json:"address"`
	}

	if err := c.ShouldBindJSON(&shopInput); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update only non-empty fields
	updates := make(map[string]interface{})
	if shopInput.Name != "" {
		updates["name"] = shopInput.Name
	}
	if shopInput.Description != "" {
		updates["description"] = shopInput.Description
	}
	if shopInput.Logo != "" {
		updates["logo"] = shopInput.Logo
	}
	if shopInput.Address != "" {
		updates["address"] = shopInput.Address
	}

	// Update the shop
	if err := config.DB.Model(&shop).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update shop"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Shop updated successfully",
		"shop":    shop,
	})
}

// Order handlers
func getOrders(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get all orders endpoint"})
}

func getOrder(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{"message": "Get order endpoint", "id": id})
}

func createOrder(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Create order endpoint"})
}

func updateOrder(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{"message": "Update order endpoint", "id": id})
}

// Invoice handlers
func getInvoices(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get all invoices endpoint"})
}

func getInvoice(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{"message": "Get invoice endpoint", "id": id})
}

// User handlers
func getUser(c *gin.Context) {
	userID := c.Param("id")
	var user models.User

	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Don't send password
	user.Password = ""

	c.JSON(http.StatusOK, gin.H{"user": user})
}

func updateUser(c *gin.Context) {
	userID := c.Param("id")
	var user models.User

	// Find user
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Get update data
	var updateData struct {
		Username  string `json:"username"`
		Email     string `json:"email"`
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Phone     string `json:"phone"`
		Address   string `json:"address"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if username or email is already taken (if being changed)
	if updateData.Username != user.Username {
		var count int64
		config.DB.Model(&models.User{}).Where("username = ?", updateData.Username).Count(&count)
		if count > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username is already taken"})
			return
		}
	}

	if updateData.Email != user.Email {
		var count int64
		config.DB.Model(&models.User{}).Where("email = ?", updateData.Email).Count(&count)
		if count > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email is already taken"})
			return
		}
	}

	// Update fields
	user.Username = updateData.Username
	user.Email = updateData.Email
	user.FirstName = updateData.FirstName
	user.LastName = updateData.LastName
	user.Phone = updateData.Phone
	user.Address = updateData.Address

	// Save changes
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	// Don't send password
	user.Password = ""

	c.JSON(http.StatusOK, gin.H{
		"message": "User updated successfully",
		"user":    user,
	})
}

func updateUserAvatar(c *gin.Context) {
	userID := c.Param("id")
	var user models.User

	// Find user
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Get avatar data
	var avatarData struct {
		Avatar string `json:"avatar"`
	}

	if err := c.ShouldBindJSON(&avatarData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if avatarData.Avatar == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Avatar data is required"})
		return
	}

	// Update avatar field
	user.Avatar = avatarData.Avatar

	// Save changes
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user avatar"})
		return
	}

	// Don't send password
	user.Password = ""

	c.JSON(http.StatusOK, gin.H{
		"message": "Avatar updated successfully",
		"user":    user,
	})
}

func getUserIDFromToken(c *gin.Context) (int, error) {
	// Get token from header
	tokenString := c.GetHeader("Authorization")
	if tokenString == "" {
		return 0, errors.New("authorization header is required")
	}

	// Remove Bearer prefix
	tokenString = strings.TrimPrefix(tokenString, "Bearer ")

	// Extract user ID from token (format: "<userId>_<username>_<timestamp>")
	parts := strings.Split(tokenString, "_")
	if len(parts) < 1 {
		return 0, errors.New("invalid token format")
	}

	// Parse user ID to integer
	userID, err := strconv.Atoi(parts[0])
	if err != nil {
		return 0, errors.New("invalid user ID in token")
	}

	return userID, nil
}
