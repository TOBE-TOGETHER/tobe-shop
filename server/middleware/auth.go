package middleware

import (
	"log"
	"net/http"
	"strings"
	"tobe_shop/server/config"
	"tobe_shop/server/models"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware verifies the token in the Authorization header
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Println("Auth middleware activated for:", c.Request.URL.Path)

		authHeader := c.GetHeader("Authorization")
		log.Printf("Authorization header: %s", authHeader)

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		// Extract the token from the Authorization header
		// Format: "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer <token>"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		log.Printf("Token extracted: %s", tokenString)

		// In a real app, this would validate a JWT token
		// Here we're using a simple token format: "<userId>_<username>_<timestamp>"
		parts = strings.Split(tokenString, "_")
		if len(parts) != 3 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			c.Abort()
			return
		}

		userID := parts[0]
		log.Printf("User ID extracted from token: %s", userID)

		// Find user in the database
		var user models.User
		if err := config.DB.First(&user, userID).Error; err != nil {
			log.Printf("Failed to find user with ID: %s, error: %v", userID, err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Set the user ID in the context
		c.Set("userId", userID)
		log.Printf("Set userId in context: %s", userID)
		c.Next()
	}
}
