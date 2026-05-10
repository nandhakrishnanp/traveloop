package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"oodo.hackathon/internal/database/db"
	"oodo.hackathon/internal/database/models"
	"oodo.hackathon/internal/middlewares"
)

// TripsHandler handles trip-related endpoints
type TripsHandler struct {
	queries db.Querier
}

// NewTripsHandler creates a new trips handler
func NewTripsHandler(queries db.Querier) *TripsHandler {
	return &TripsHandler{
		queries: queries,
	}
}

// CreateTrip creates a new trip
func (h *TripsHandler) CreateTrip(c *gin.Context) {
	ctx := c.Request.Context()

	userID, err := middlewares.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.CreateTripRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse dates to validate format
	_, err = parseDate(req.StartDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start_date format. Use YYYY-MM-DD"})
		return
	}

	_, err = parseDate(req.EndDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end_date format. Use YYYY-MM-DD"})
		return
	}

	// Create trip in database
	isPublic := req.IsPublic
	trip, err := h.queries.CreateTrip(ctx, db.CreateTripParams{
		UserID:        userID,
		Name:          req.Name,
		Description:   req.Description,
		StartDate:     pgtype.Date{Time: mustParseDate(req.StartDate), Valid: true},
		EndDate:       pgtype.Date{Time: mustParseDate(req.EndDate), Valid: true},
		CoverPhotoUrl: req.CoverPhotoURL,
		IsPublic:      &isPublic,
		PublicSlug:    req.PublicSlug,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create trip"})
		return
	}

	// Build response
	response := buildTripResponse(trip)
	response.StopsCount = 0
	totalBudget := 0.0
	response.TotalBudget = &totalBudget

	c.JSON(http.StatusCreated, response)
}

// GetTrips retrieves user's trips with pagination
func (h *TripsHandler) GetTrips(c *gin.Context) {
	ctx := c.Request.Context()

	userID, err := middlewares.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get pagination parameters
	limit := int32(20)
	offset := int32(0)

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = int32(parsed)
		}
	}

	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = int32(parsed)
		}
	}

	// Fetch trips from database
	trips, err := h.queries.GetUserTrips(ctx, db.GetUserTripsParams{
		UserID: userID,
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch trips"})
		return
	}

	// Build responses
	tripResponses := make([]models.TripResponse, len(trips))
	for i, trip := range trips {
		tripResponses[i] = buildTripResponse(trip)
	}

	c.JSON(http.StatusOK, gin.H{
		"data": tripResponses,
		"pagination": gin.H{
			"limit":  limit,
			"offset": offset,
			"total":  len(tripResponses),
		},
	})
}

// GetTrip retrieves a specific trip
func (h *TripsHandler) GetTrip(c *gin.Context) {
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

	// Fetch trip from database
	trip, err := h.queries.GetTripByID(ctx, tripID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Trip not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Check authorization
	if trip.UserID != userID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trip not found"})
		return
	}

	response := buildTripResponse(trip)
	c.JSON(http.StatusOK, response)
}

// UpdateTrip updates a trip
func (h *TripsHandler) UpdateTrip(c *gin.Context) {
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

	var req models.UpdateTripRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate dates if provided
	var startDate, endDate pgtype.Date
	if req.StartDate != nil {
		_, err := parseDate(*req.StartDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start_date format. Use YYYY-MM-DD"})
			return
		}
		startDate = pgtype.Date{Time: mustParseDate(*req.StartDate), Valid: true}
	}

	if req.EndDate != nil {
		_, err := parseDate(*req.EndDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end_date format. Use YYYY-MM-DD"})
			return
		}
		endDate = pgtype.Date{Time: mustParseDate(*req.EndDate), Valid: true}
	}

	// Update trip in database
	updatedTrip, err := h.queries.UpdateTrip(ctx, db.UpdateTripParams{
		ID:            tripID,
		Name:          req.Name,
		Description:   req.Description,
		StartDate:     startDate,
		EndDate:       endDate,
		CoverPhotoUrl: req.CoverPhotoURL,
		IsPublic:      req.IsPublic,
		PublicSlug:    req.PublicSlug,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update trip"})
		return
	}

	response := buildTripResponse(updatedTrip)
	c.JSON(http.StatusOK, response)
}

// DeleteTrip deletes a trip
func (h *TripsHandler) DeleteTrip(c *gin.Context) {
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

	// Delete trip
	err = h.queries.DeleteTrip(ctx, tripID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete trip"})
		return
	}

	c.Status(http.StatusNoContent)
}

// GetItinerary retrieves complete trip itinerary with stops, activities, and day-by-day breakdown
func (h *TripsHandler) GetItinerary(c *gin.Context) {
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

	// Fetch stops for the trip
	stops, err := h.queries.GetTripStops(ctx, tripID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stops"})
		return
	}

	// Build stop responses
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

	// Fetch expenses and calculate total cost
	expenses, err := h.queries.GetTripExpenses(ctx, tripID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch expenses"})
		return
	}

	totalCost := 0.0
	for _, expense := range expenses {
		totalCost += parseNumericToFloat64(expense.Amount)
	}

	// Build day-by-day breakdown
	dayByDayMap := make(map[string]gin.H)

	// Add expenses to day-by-day breakdown
	for _, expense := range expenses {
		dateStr := expense.ExpenseDate.Time.Format("2006-01-02")
		if _, exists := dayByDayMap[dateStr]; !exists {
			dayByDayMap[dateStr] = gin.H{
				"date":       dateStr,
				"activities": []gin.H{},
				"expenses":   []gin.H{},
				"total":      0.0,
			}
		}

		day := dayByDayMap[dateStr]
		expenses := day["expenses"].([]gin.H)
		expenses = append(expenses, gin.H{
			"id":          expense.ID,
			"type":        expense.ExpenseType,
			"amount":      parseNumericToFloat64(expense.Amount),
			"currency":    expense.Currency,
			"description": expense.Description,
		})
		day["expenses"] = expenses

		total := day["total"].(float64)
		total += parseNumericToFloat64(expense.Amount)
		day["total"] = total
		dayByDayMap[dateStr] = day
	}

	// Add activities to day-by-day breakdown
	for _, stop := range stops {
		activities, err := h.queries.GetTripActivitiesByStop(ctx, stop.ID)
		if err != nil {
			continue
		}

		for _, activity := range activities {
			dateStr := activity.ScheduledDate.Time.Format("2006-01-02")
			if _, exists := dayByDayMap[dateStr]; !exists {
				dayByDayMap[dateStr] = gin.H{
					"date":       dateStr,
					"activities": []gin.H{},
					"expenses":   []gin.H{},
					"total":      0.0,
				}
			}

			day := dayByDayMap[dateStr]
			actList := day["activities"].([]gin.H)

			timeStr := "00:00"
			if activity.ScheduledTime.Valid {
				totalSeconds := activity.ScheduledTime.Microseconds / 1_000_000
				hours := totalSeconds / 3600
				minutes := (totalSeconds % 3600) / 60
				timeStr = fmt.Sprintf("%02d:%02d", hours, minutes)
			}

			actList = append(actList, gin.H{
				"id":       activity.ID,
				"name":     activity.ActivityName,
				"time":     timeStr,
				"cost":     parseNumericToFloat64(activity.ActualCost),
				"category": activity.Category,
				"notes":    activity.Notes,
				"order":    activity.ActivityOrder,
			})
			day["activities"] = actList

			total := day["total"].(float64)
			total += parseNumericToFloat64(activity.ActualCost)
			day["total"] = total
			dayByDayMap[dateStr] = day
		}
	}

	// Convert map to sorted array
	dayByDay := make([]gin.H, 0, len(dayByDayMap))
	for date := trip.StartDate.Time; date.Before(trip.EndDate.Time) || date.Equal(trip.EndDate.Time); date = date.AddDate(0, 0, 1) {
		dateStr := date.Format("2006-01-02")
		if day, exists := dayByDayMap[dateStr]; exists {
			dayByDay = append(dayByDay, day)
		} else {
			dayByDay = append(dayByDay, gin.H{
				"date":       dateStr,
				"activities": []gin.H{},
				"expenses":   []gin.H{},
				"total":      0.0,
			})
		}
	}

	// Build response
	response := gin.H{
		"trip":       buildTripResponse(trip),
		"stops":      stopResponses,
		"day_by_day": dayByDay,
		"total_cost": totalCost,
		"total_days": calculateDays(trip),
	}

	c.JSON(http.StatusOK, response)
}

// Helper functions

func buildTripResponse(trip db.Trip) models.TripResponse {
	response := models.TripResponse{
		ID:            trip.ID,
		UserID:        trip.UserID,
		Name:          trip.Name,
		Description:   trip.Description,
		StartDate:     trip.StartDate.Time.Format("2006-01-02"),
		EndDate:       trip.EndDate.Time.Format("2006-01-02"),
		CoverPhotoURL: trip.CoverPhotoUrl,
		IsPublic:      false,
		PublicSlug:    trip.PublicSlug,
		CreatedAt:     trip.CreatedAt.Time,
		UpdatedAt:     trip.UpdatedAt.Time,
	}
	if trip.IsPublic != nil {
		response.IsPublic = *trip.IsPublic
	}
	return response
}

func calculateDays(trip db.Trip) int {
	if trip.StartDate.Valid && trip.EndDate.Valid {
		return int(trip.EndDate.Time.Sub(trip.StartDate.Time).Hours() / 24)
	}
	return 0
}
