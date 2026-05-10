package handlers

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"oodo.hackathon/internal/database/db"
	"oodo.hackathon/internal/database/models"
	"oodo.hackathon/internal/middlewares"
)

// StopsHandler handles trip stop-related endpoints
type StopsHandler struct {
	queries db.Querier
}

// NewStopsHandler creates a new stops handler
func NewStopsHandler(queries db.Querier) *StopsHandler {
	return &StopsHandler{
		queries: queries,
	}
}

// CreateStop adds a city stop to a trip itinerary
func (h *StopsHandler) CreateStop(c *gin.Context) {
	ctx := c.Request.Context()

	userID, err := middlewares.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	tripID, err := uuid.Parse(c.Param("tripId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid trip ID"})
		return
	}

	// Check trip exists and belongs to user
	trip, err := h.queries.GetTripByID(ctx, tripID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Trip not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if trip.UserID != userID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trip not found"})
		return
	}

	var req models.CreateTripStopRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate dates
	arrivalDate, err := parseDate(req.ArrivalDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid arrival_date format. Use YYYY-MM-DD"})
		return
	}

	departureDate, err := parseDate(req.DepartureDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid departure_date format. Use YYYY-MM-DD"})
		return
	}

	// Create stop in database
	stop, err := h.queries.CreateTripStop(ctx, db.CreateTripStopParams{
		TripID:        tripID,
		CityID:        req.CityID,
		ArrivalDate:   pgtype.Date{Time: arrivalDate, Valid: true},
		DepartureDate: pgtype.Date{Time: departureDate, Valid: true},
		StopOrder:     int32(req.StopOrder),
		Notes:         req.Notes,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create stop"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":             stop.ID,
		"trip_id":        stop.TripID,
		"city_id":        stop.CityID,
		"arrival_date":   arrivalDate.Format("2006-01-02"),
		"departure_date": departureDate.Format("2006-01-02"),
		"stop_order":     stop.StopOrder,
		"notes":          stop.Notes,
		"created_at":     stop.CreatedAt.Time.Format("2006-01-02T15:04:05Z"),
	})
}

// GetStops retrieves all stops for a trip
func (h *StopsHandler) GetStops(c *gin.Context) {
	ctx := c.Request.Context()

	userID, err := middlewares.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	tripID, err := uuid.Parse(c.Param("tripId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid trip ID"})
		return
	}

	// Check trip exists and belongs to user
	trip, err := h.queries.GetTripByID(ctx, tripID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Trip not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if trip.UserID != userID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trip not found"})
		return
	}

	// Fetch stops
	stops, err := h.queries.GetTripStops(ctx, tripID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stops"})
		return
	}

	// Build responses
	stopResponses := make([]gin.H, len(stops))
	for i, stop := range stops {
		stopResponses[i] = gin.H{
			"id":             stop.ID,
			"trip_id":        stop.TripID,
			"city_id":        stop.CityID,
			"city_name":      stop.CityName,
			"country":        stop.Country,
			"cost_index":     stop.CostIndex,
			"city_image":     stop.CityImage,
			"arrival_date":   stop.ArrivalDate.Time.Format("2006-01-02"),
			"departure_date": stop.DepartureDate.Time.Format("2006-01-02"),
			"stop_order":     stop.StopOrder,
			"notes":          stop.Notes,
			"created_at":     stop.CreatedAt.Time.Format("2006-01-02T15:04:05Z"),
		}
	}

	c.JSON(http.StatusOK, stopResponses)
}

// GetStop retrieves a specific stop
func (h *StopsHandler) GetStop(c *gin.Context) {
	ctx := c.Request.Context()

	userID, err := middlewares.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	stopID, err := uuid.Parse(c.Param("stopId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid stop ID"})
		return
	}

	// Fetch stop
	stopRow, err := h.queries.GetTripStopByID(ctx, stopID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Stop not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Check authorization
	trip, err := h.queries.GetTripByID(ctx, stopRow.TripID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if trip.UserID != userID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Stop not found"})
		return
	}

	response := buildStopResponse(stopRow)
	c.JSON(http.StatusOK, response)
}

// UpdateStop updates a trip stop
func (h *StopsHandler) UpdateStop(c *gin.Context) {
	ctx := c.Request.Context()

	userID, err := middlewares.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	stopID, err := uuid.Parse(c.Param("stopId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid stop ID"})
		return
	}

	// Fetch current stop
	currentStopRow, err := h.queries.GetTripStopByID(ctx, stopID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Stop not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Check authorization
	trip, err := h.queries.GetTripByID(ctx, currentStopRow.TripID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if trip.UserID != userID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Stop not found"})
		return
	}

	var req models.UpdateTripStopRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Prepare update parameters
	var arrivalDate, departureDate pgtype.Date
	if req.ArrivalDate != nil {
		parsedDate, err := parseDate(*req.ArrivalDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid arrival_date format. Use YYYY-MM-DD"})
			return
		}
		arrivalDate = pgtype.Date{Time: parsedDate, Valid: true}
	}

	if req.DepartureDate != nil {
		parsedDate, err := parseDate(*req.DepartureDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid departure_date format. Use YYYY-MM-DD"})
			return
		}
		departureDate = pgtype.Date{Time: parsedDate, Valid: true}
	}

	// Convert stop order to int32 if provided
	var stopOrder *int32
	if req.StopOrder != nil {
		val := int32(*req.StopOrder)
		stopOrder = &val
	}

	// Update stop
	_, err = h.queries.UpdateTripStop(ctx, db.UpdateTripStopParams{
		ID:            stopID,
		ArrivalDate:   arrivalDate,
		DepartureDate: departureDate,
		StopOrder:     stopOrder,
		Notes:         req.Notes,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stop"})
		return
	}

	// Fetch updated stop with city details
	updatedStopRow, err := h.queries.GetTripStopByID(ctx, stopID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated stop"})
		return
	}

	response := buildStopResponse(updatedStopRow)
	c.JSON(http.StatusOK, response)
}

// DeleteStop removes a stop from a trip
func (h *StopsHandler) DeleteStop(c *gin.Context) {
	ctx := c.Request.Context()

	userID, err := middlewares.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	stopID, err := uuid.Parse(c.Param("stopId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid stop ID"})
		return
	}

	// Fetch stop
	stopRow, err := h.queries.GetTripStopByID(ctx, stopID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Stop not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Check authorization
	trip, err := h.queries.GetTripByID(ctx, stopRow.TripID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if trip.UserID != userID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Stop not found"})
		return
	}

	// Delete stop
	err = h.queries.DeleteTripStop(ctx, stopID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete stop"})
		return
	}

	c.Status(http.StatusNoContent)
}

// Helper functions

func buildStopResponse(stop db.GetTripStopByIDRow) gin.H {
	return gin.H{
		"id":             stop.ID,
		"trip_id":        stop.TripID,
		"city_id":        stop.CityID,
		"city_name":      stop.CityName,
		"country":        stop.Country,
		"arrival_date":   stop.ArrivalDate.Time.Format("2006-01-02"),
		"departure_date": stop.DepartureDate.Time.Format("2006-01-02"),
		"stop_order":     stop.StopOrder,
		"notes":          stop.Notes,
		"created_at":     stop.CreatedAt.Time.Format("2006-01-02T15:04:05Z"),
	}
}
