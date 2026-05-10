package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"oodo.hackathon/internal/database/db"
	"oodo.hackathon/internal/middlewares"
)

// DashboardHandler handles dashboard-related endpoints
type DashboardHandler struct {
	queries db.Querier
}

// NewDashboardHandler creates a new dashboard handler
func NewDashboardHandler(queries db.Querier) *DashboardHandler {
	return &DashboardHandler{
		queries: queries,
	}
}

// GetDashboard retrieves user dashboard with overview data
// GET /dashboard
func (h *DashboardHandler) GetDashboard(c *gin.Context) {
	ctx := c.Request.Context()

	userID, err := middlewares.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get upcoming trips
	upcomingTrips, err := h.queries.GetUpcomingTrips(ctx, db.GetUpcomingTripsParams{
		UserID: userID,
		Limit:  10,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch upcoming trips"})
		return
	}

	// Get recent trips
	recentTrips, err := h.queries.GetUserTrips(ctx, db.GetUserTripsParams{
		UserID: userID,
		Limit:  5,
		Offset: 0,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch recent trips"})
		return
	}

	// Get popular cities
	popularCities, err := h.queries.GetPopularCities(ctx, 5)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch popular cities"})
		return
	}

	// Get saved destinations
	savedDestinations, err := h.queries.GetSavedDestinations(ctx, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch saved destinations"})
		return
	}

	// Get total trips count for user
	allTrips, err := h.queries.GetUserTrips(ctx, db.GetUserTripsParams{
		UserID: userID,
		Limit:  10000, // Large limit to get total count
		Offset: 0,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch trips count"})
		return
	}

	// Format upcoming trips response
	var upcomingTripsResponse []gin.H
	for _, trip := range upcomingTrips {
		upcomingTripsResponse = append(upcomingTripsResponse, formatTripResponse(trip))
	}
	if upcomingTripsResponse == nil {
		upcomingTripsResponse = []gin.H{}
	}

	// Format recent trips response
	var recentTripsResponse []gin.H
	for _, trip := range recentTrips {
		recentTripsResponse = append(recentTripsResponse, formatTripResponse(trip))
	}
	if recentTripsResponse == nil {
		recentTripsResponse = []gin.H{}
	}

	// Format popular cities response
	var popularCitiesResponse []gin.H
	for _, city := range popularCities {
		costIndex := parseNumericToFloat64(city.CostIndex)
		popularityScore := 0
		if city.PopularityScore != nil {
			popularityScore = int(*city.PopularityScore)
		}

		popularCitiesResponse = append(popularCitiesResponse, gin.H{
			"id":               city.ID,
			"name":             city.Name,
			"country":          city.Country,
			"region":           city.Region,
			"cost_index":       costIndex,
			"popularity_score": popularityScore,
			"image_url":        city.ImageUrl,
		})
	}
	if popularCitiesResponse == nil {
		popularCitiesResponse = []gin.H{}
	}

	// Format saved destinations response
	var savedDestinationsResponse []gin.H
	for _, destination := range savedDestinations {
		costIndex := parseNumericToFloat64(destination.CostIndex)

		savedDestinationsResponse = append(savedDestinationsResponse, gin.H{
			"id":         destination.CityID,
			"name":       destination.Name,
			"country":    destination.Country,
			"cost_index": costIndex,
			"image_url":  destination.ImageUrl,
		})
	}
	if savedDestinationsResponse == nil {
		savedDestinationsResponse = []gin.H{}
	}

	c.JSON(http.StatusOK, gin.H{
		"upcoming_trips":     upcomingTripsResponse,
		"recent_trips":       recentTripsResponse,
		"popular_cities":     popularCitiesResponse,
		"saved_destinations": savedDestinationsResponse,
		"total_trips_count":  len(allTrips),
	})
}

// Helper function to format trip response
func formatTripResponse(trip db.Trip) gin.H {
	startDate := trip.StartDate.Time.Format("2006-01-02")
	endDate := trip.EndDate.Time.Format("2006-01-02")

	return gin.H{
		"id":              trip.ID,
		"user_id":         trip.UserID,
		"name":            trip.Name,
		"description":     trip.Description,
		"start_date":      startDate,
		"end_date":        endDate,
		"cover_photo_url": trip.CoverPhotoUrl,
		"is_public":       trip.IsPublic,
		"stops_count":     0, // Will be populated from trip details if needed
		"total_budget":    nil,
		"created_at":      trip.CreatedAt,
		"updated_at":      trip.UpdatedAt,
	}
}
