package handlers

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"oodo.hackathon/internal/database/db"
	"oodo.hackathon/internal/database/models"
	"oodo.hackathon/internal/middlewares"
)

// AuthHandler handles authentication endpoints
type AuthHandler struct {
	queries db.Querier
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(queries db.Querier) *AuthHandler {
	return &AuthHandler{
		queries: queries,
	}
}

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	ctx := c.Request.Context()

	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if email already exists
	_, err := h.queries.GetUserByEmail(ctx, req.Email)
	if err == nil {
		// User exists
		c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create user
	user, err := h.queries.CreateUser(ctx, db.CreateUserParams{
		Email:           req.Email,
		PasswordHash:    string(hashedPassword),
		FullName:        req.FullName,
		ProfilePhotoUrl: nil,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Generate token
	token, _, err := middlewares.GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Build response
	userResponse := models.UserResponse{
		ID:              user.ID,
		Email:           user.Email,
		FullName:        user.FullName,
		ProfilePhotoURL: user.ProfilePhotoUrl,
		Language:        "en",
		CreatedAt:       user.CreatedAt.Time,
	}
	if user.LanguagePreference != nil {
		userResponse.Language = *user.LanguagePreference
	}

	c.JSON(http.StatusCreated, gin.H{
		"token": token,
		"user":  userResponse,
	})
}

// Login handles user authentication
func (h *AuthHandler) Login(c *gin.Context) {
	ctx := c.Request.Context()

	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.queries.GetUserByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate token
	token, _, err := middlewares.GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Build response
	userResponse := models.UserResponse{
		ID:              user.ID,
		Email:           user.Email,
		FullName:        user.FullName,
		ProfilePhotoURL: user.ProfilePhotoUrl,
		Language:        "en",
		CreatedAt:       user.CreatedAt.Time,
	}
	if user.LanguagePreference != nil {
		userResponse.Language = *user.LanguagePreference
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  userResponse,
	})
}

// GetProfile retrieves the current user's profile
func (h *AuthHandler) GetProfile(c *gin.Context) {
	ctx := c.Request.Context()

	// Get user ID from context (set by auth middleware)
	userID, err := middlewares.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Fetch user from database
	user, err := h.queries.GetUserByID(ctx, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Build response
	userResponse := models.UserResponse{
		ID:              user.ID,
		Email:           user.Email,
		FullName:        user.FullName,
		ProfilePhotoURL: user.ProfilePhotoUrl,
		Language:        "en",
		CreatedAt:       user.CreatedAt.Time,
	}
	if user.LanguagePreference != nil {
		userResponse.Language = *user.LanguagePreference
	}

	c.JSON(http.StatusOK, userResponse)
}

// UpdateProfile updates the current user's profile
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	ctx := c.Request.Context()

	// Get user ID from context (set by auth middleware)
	userID, err := middlewares.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update user in database
	user, err := h.queries.UpdateUserProfile(ctx, db.UpdateUserProfileParams{
		ID:                 userID,
		FullName:           req.FullName,
		ProfilePhotoUrl:    req.ProfilePhotoURL,
		LanguagePreference: req.Language,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	// Build response
	userResponse := models.UserResponse{
		ID:              user.ID,
		Email:           user.Email,
		FullName:        user.FullName,
		ProfilePhotoURL: user.ProfilePhotoUrl,
		Language:        "en",
		CreatedAt:       user.CreatedAt.Time,
	}
	if user.LanguagePreference != nil {
		userResponse.Language = *user.LanguagePreference
	}

	c.JSON(http.StatusOK, userResponse)
}
