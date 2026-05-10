package handlers

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"oodo.hackathon/internal/database/db"
	"oodo.hackathon/internal/middlewares"
)

// CitiesHandler handles city-related endpoints
type CitiesHandler struct {
	queries db.Querier
}

// NewCitiesHandler creates a new cities handler
func NewCitiesHandler(queries db.Querier) *CitiesHandler {
	return &CitiesHandler{
		queries: queries,
	}
}

// SearchCities searches for cities to add to itinerary
// GET /cities/search?q=paris&limit=20&offset=0
func (h *CitiesHandler) SearchCities(c *gin.Context) {
	ctx := c.Request.Context()

	_, err := middlewares.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get search query parameter (required)
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query 'q' is required"})
		return
	}

	// Get pagination parameters
	limit := 20
	offset := 0

	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			if l > 100 {
				l = 100 // Cap at 100
			}
			limit = l
		}
	}

	if offsetStr := c.Query("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	// Search cities
	cities, err := h.queries.SearchCities(ctx, db.SearchCitiesParams{
		Column1: &query,
		Limit:   int32(limit),
		Offset:  int32(offset),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search cities"})
		return
	}

	// Format response
	var data []gin.H
	for _, city := range cities {
		costIndex := parseNumericToFloat64(city.CostIndex)
		popularityScore := 0
		if city.PopularityScore != nil {
			popularityScore = int(*city.PopularityScore)
		}

		latitude := (*float64)(nil)
		if city.Latitude.Valid {
			f8, err := city.Latitude.Float64Value()
			if err == nil {
				latitude = &f8.Float64
			}
		}

		longitude := (*float64)(nil)
		if city.Longitude.Valid {
			f8, err := city.Longitude.Float64Value()
			if err == nil {
				longitude = &f8.Float64
			}
		}

		data = append(data, gin.H{
			"id":               city.ID,
			"name":             city.Name,
			"country":          city.Country,
			"region":           city.Region,
			"cost_index":       costIndex,
			"popularity_score": popularityScore,
			"latitude":         latitude,
			"longitude":        longitude,
			"description":      city.Description,
			"image_url":        city.ImageUrl,
			"created_at":       city.CreatedAt,
		})
	}

	if data == nil {
		data = []gin.H{}
	}

	c.JSON(http.StatusOK, gin.H{
		"data": data,
		"pagination": gin.H{
			"limit":  limit,
			"offset": offset,
			"total":  len(data),
		},
	})
}

// GetCityByID retrieves detailed city information
// GET /cities/:cityId
func (h *CitiesHandler) GetCityByID(c *gin.Context) {
	ctx := c.Request.Context()

	_, err := middlewares.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	cityID, err := uuid.Parse(c.Param("cityId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid city ID"})
		return
	}

	// Get city details
	city, err := h.queries.GetCityByID(ctx, cityID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "City not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Format response
	costIndex := parseNumericToFloat64(city.CostIndex)
	popularityScore := 0
	if city.PopularityScore != nil {
		popularityScore = int(*city.PopularityScore)
	}

	latitude := (*float64)(nil)
	if city.Latitude.Valid {
		f8, err := city.Latitude.Float64Value()
		if err == nil {
			latitude = &f8.Float64
		}
	}

	longitude := (*float64)(nil)
	if city.Longitude.Valid {
		f8, err := city.Longitude.Float64Value()
		if err == nil {
			longitude = &f8.Float64
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"id":               city.ID,
		"name":             city.Name,
		"country":          city.Country,
		"region":           city.Region,
		"cost_index":       costIndex,
		"popularity_score": popularityScore,
		"latitude":         latitude,
		"longitude":        longitude,
		"description":      city.Description,
		"image_url":        city.ImageUrl,
		"created_at":       city.CreatedAt,
	})
}
