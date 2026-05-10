package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"oodo.hackathon/internal/database/db"
	"oodo.hackathon/internal/database/models"
	"oodo.hackathon/internal/middlewares"
)

// ActivitiesHandler handles activity-related endpoints
type ActivitiesHandler struct {
	queries db.Querier
}

// NewActivitiesHandler creates a new activities handler
func NewActivitiesHandler(queries db.Querier) *ActivitiesHandler {
	return &ActivitiesHandler{
		queries: queries,
	}
}

// GetActivitiesByCity retrieves all available activities in a city with optional category filter
// GET /cities/:cityId/activities
func (h *ActivitiesHandler) GetActivitiesByCity(c *gin.Context) {
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

	// Verify city exists
	_, err = h.queries.GetCityByID(ctx, cityID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "City not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	category := c.Query("category")

	var activities []db.Activity
	if category != "" {
		// Get activities by category
		acts, err := h.queries.GetActivitiesByCategory(ctx, db.GetActivitiesByCategoryParams{
			CityID:   cityID,
			Category: category,
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch activities"})
			return
		}
		activities = acts
	} else {
		// Get all activities for city
		acts, err := h.queries.GetActivitiesByCity(ctx, cityID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch activities"})
			return
		}
		activities = acts
	}

	// Format response
	var response []gin.H
	for _, activity := range activities {
		estimatedCost := parseNumericToFloat64(activity.EstimatedCost)
		response = append(response, gin.H{
			"id":               activity.ID,
			"city_id":          activity.CityID,
			"name":             activity.Name,
			"description":      activity.Description,
			"category":         activity.Category,
			"estimated_cost":   estimatedCost,
			"duration_minutes": activity.DurationMinutes,
			"image_url":        activity.ImageUrl,
			"created_at":       activity.CreatedAt,
		})
	}

	if response == nil {
		response = []gin.H{}
	}

	c.JSON(http.StatusOK, response)
}

// AddActivityToStop adds an activity to a trip stop
// POST /stops/:stopId/activities
func (h *ActivitiesHandler) AddActivityToStop(c *gin.Context) {
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

	// Verify stop exists and user has access
	stop, err := h.queries.GetTripStopByID(ctx, stopID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Stop not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Verify trip ownership
	trip, err := h.queries.GetTripByID(ctx, stop.TripID)
	if err != nil || trip.UserID != userID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Stop not found"})
		return
	}

	var req models.CreateTripActivityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate activity exists
	activity, err := h.queries.GetActivityByID(ctx, req.ActivityID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Activity not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Parse scheduled date
	scheduledDate, err := parseDate(req.ScheduledDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid scheduled_date format. Use YYYY-MM-DD"})
		return
	}

	// Parse scheduled time if provided
	var scheduledTime pgtype.Time
	if req.ScheduledTime != nil {
		t, err := time.Parse("15:04:05", *req.ScheduledTime)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid scheduled_time format. Use HH:MM:SS"})
			return
		}
		scheduledTime = pgtype.Time{
			Microseconds: int64(t.Hour()*3600+t.Minute()*60+t.Second()) * 1_000_000,
			Valid:        true,
		}
	}

	// Parse actual cost
	var actualCost pgtype.Numeric
	if req.ActualCost != nil {
		actualCost = parseFloat64ToNumeric(*req.ActualCost)
	}

	// Create trip activity
	tripActivity, err := h.queries.CreateTripActivity(ctx, db.CreateTripActivityParams{
		TripStopID:    stopID,
		ActivityID:    req.ActivityID,
		ScheduledDate: pgtype.Date{Time: scheduledDate, Valid: true},
		ScheduledTime: scheduledTime,
		ActualCost:    actualCost,
		Notes:         req.Notes,
		ActivityOrder: toInt32Ptr(int32(req.ActivityOrder)),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add activity"})
		return
	}

	// Build response
	estimatedCost := parseNumericToFloat64(activity.EstimatedCost)
	actualCostFloat := parseNumericToFloat64(tripActivity.ActualCost)

	scheduledTimeStr := ""
	if tripActivity.ScheduledTime.Valid {
		// Convert microseconds back to time string
		totalSeconds := tripActivity.ScheduledTime.Microseconds / 1_000_000
		hours := totalSeconds / 3600
		minutes := (totalSeconds % 3600) / 60
		seconds := totalSeconds % 60
		scheduledTimeStr = fmt.Sprintf("%02d:%02d:%02d", hours, minutes, seconds)
	}

	activityOrder := 0
	if tripActivity.ActivityOrder != nil {
		activityOrder = int(*tripActivity.ActivityOrder)
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":               tripActivity.ID,
		"trip_stop_id":     tripActivity.TripStopID,
		"activity_id":      tripActivity.ActivityID,
		"activity_name":    activity.Name,
		"description":      activity.Description,
		"category":         activity.Category,
		"estimated_cost":   estimatedCost,
		"actual_cost":      actualCostFloat,
		"duration_minutes": activity.DurationMinutes,
		"scheduled_date":   scheduledDate.Format("2006-01-02"),
		"scheduled_time":   convertScheduledTime(scheduledTimeStr),
		"activity_order":   activityOrder,
		"notes":            tripActivity.Notes,
		"image_url":        activity.ImageUrl,
		"created_at":       tripActivity.CreatedAt,
	})
}

// GetActivitiesByStop retrieves all activities for a specific trip stop
// GET /stops/:stopId/activities
func (h *ActivitiesHandler) GetActivitiesByStop(c *gin.Context) {
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

	// Verify stop exists and user has access
	stop, err := h.queries.GetTripStopByID(ctx, stopID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Stop not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Verify trip ownership
	trip, err := h.queries.GetTripByID(ctx, stop.TripID)
	if err != nil || trip.UserID != userID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Stop not found"})
		return
	}

	// Get activities for the stop
	activities, err := h.queries.GetTripActivitiesByStop(ctx, stopID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch activities"})
		return
	}

	// Format response
	var response []gin.H
	for _, activity := range activities {
		estimatedCost := parseNumericToFloat64(activity.EstimatedCost)
		actualCost := parseNumericToFloat64(activity.ActualCost)

		scheduledTimeStr := ""
		if activity.ScheduledTime.Valid {
			totalSeconds := activity.ScheduledTime.Microseconds / 1_000_000
			hours := totalSeconds / 3600
			minutes := (totalSeconds % 3600) / 60
			seconds := totalSeconds % 60
			scheduledTimeStr = fmt.Sprintf("%02d:%02d:%02d", hours, minutes, seconds)
		}

		activityOrder := 0
		if activity.ActivityOrder != nil {
			activityOrder = int(*activity.ActivityOrder)
		}

		response = append(response, gin.H{
			"id":               activity.ID,
			"trip_stop_id":     activity.TripStopID,
			"activity_id":      activity.ActivityID,
			"activity_name":    activity.ActivityName,
			"description":      activity.Description,
			"category":         activity.Category,
			"estimated_cost":   estimatedCost,
			"actual_cost":      convertActualCost(actualCost),
			"duration_minutes": activity.DurationMinutes,
			"scheduled_date":   activity.ScheduledDate.Time.Format("2006-01-02"),
			"scheduled_time":   convertScheduledTime(scheduledTimeStr),
			"activity_order":   activityOrder,
			"notes":            activity.Notes,
			"image_url":        activity.ImageUrl,
			"created_at":       activity.CreatedAt,
		})
	}

	if response == nil {
		response = []gin.H{}
	}

	c.JSON(http.StatusOK, response)
}

// UpdateTripActivity updates trip activity details
// PATCH /trip-activities/:activityId
func (h *ActivitiesHandler) UpdateTripActivity(c *gin.Context) {
	ctx := c.Request.Context()

	userID, err := middlewares.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	activityID, err := uuid.Parse(c.Param("activityId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid activity ID"})
		return
	}

	// Get the trip activity
	tripActivity, err := h.queries.GetTripActivityByID(ctx, activityID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Activity not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Verify user has access via stop and trip
	stop, err := h.queries.GetTripStopByID(ctx, tripActivity.TripStopID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	trip, err := h.queries.GetTripByID(ctx, stop.TripID)
	if err != nil || trip.UserID != userID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Activity not found"})
		return
	}

	var req models.UpdateTripActivityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Build update parameters
	params := db.UpdateTripActivityParams{
		ID: activityID,
	}

	var scheduledDate pgtype.Date
	if req.ScheduledDate != nil {
		date, err := parseDate(*req.ScheduledDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid scheduled_date format. Use YYYY-MM-DD"})
			return
		}
		scheduledDate = pgtype.Date{Time: date, Valid: true}
		params.ScheduledDate = scheduledDate
	}

	if req.ScheduledTime != nil {
		t, err := time.Parse("15:04:05", *req.ScheduledTime)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid scheduled_time format. Use HH:MM:SS"})
			return
		}
		params.ScheduledTime = pgtype.Time{
			Microseconds: int64(t.Hour()*3600+t.Minute()*60+t.Second()) * 1_000_000,
			Valid:        true,
		}
	}

	if req.ActualCost != nil {
		params.ActualCost = parseFloat64ToNumeric(*req.ActualCost)
	}

	if req.Notes != nil {
		params.Notes = req.Notes
	}

	if req.ActivityOrder != nil {
		params.ActivityOrder = toInt32Ptr(int32(*req.ActivityOrder))
	}

	// Update the activity
	updated, err := h.queries.UpdateTripActivity(ctx, params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update activity"})
		return
	}

	// Get activity details for response
	activity, err := h.queries.GetActivityByID(ctx, tripActivity.ActivityID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch activity details"})
		return
	}

	// Build response
	estimatedCost := parseNumericToFloat64(activity.EstimatedCost)
	actualCost := parseNumericToFloat64(updated.ActualCost)

	scheduledTimeStr := ""
	if updated.ScheduledTime.Valid {
		totalSeconds := updated.ScheduledTime.Microseconds / 1_000_000
		hours := totalSeconds / 3600
		minutes := (totalSeconds % 3600) / 60
		seconds := totalSeconds % 60
		scheduledTimeStr = fmt.Sprintf("%02d:%02d:%02d", hours, minutes, seconds)
	}

	activityOrder := 0
	if updated.ActivityOrder != nil {
		activityOrder = int(*updated.ActivityOrder)
	}

	c.JSON(http.StatusOK, gin.H{
		"id":               updated.ID,
		"trip_stop_id":     updated.TripStopID,
		"activity_id":      updated.ActivityID,
		"activity_name":    activity.Name,
		"description":      activity.Description,
		"category":         activity.Category,
		"estimated_cost":   estimatedCost,
		"actual_cost":      convertActualCost(actualCost),
		"duration_minutes": activity.DurationMinutes,
		"scheduled_date":   updated.ScheduledDate.Time.Format("2006-01-02"),
		"scheduled_time":   convertScheduledTime(scheduledTimeStr),
		"activity_order":   activityOrder,
		"notes":            updated.Notes,
		"image_url":        activity.ImageUrl,
		"created_at":       updated.CreatedAt,
	})
}

// DeleteTripActivity removes an activity from a trip
// DELETE /trip-activities/:activityId
func (h *ActivitiesHandler) DeleteTripActivity(c *gin.Context) {
	ctx := c.Request.Context()

	userID, err := middlewares.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	activityID, err := uuid.Parse(c.Param("activityId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid activity ID"})
		return
	}

	// Get the trip activity
	tripActivity, err := h.queries.GetTripActivityByID(ctx, activityID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Activity not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Verify user has access via stop and trip
	stop, err := h.queries.GetTripStopByID(ctx, tripActivity.TripStopID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	trip, err := h.queries.GetTripByID(ctx, stop.TripID)
	if err != nil || trip.UserID != userID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Activity not found"})
		return
	}

	// Delete the activity
	if err := h.queries.DeleteTripActivity(ctx, activityID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete activity"})
		return
	}

	c.Status(http.StatusNoContent)
}

// Helper functions for numeric conversion
func parseNumericToFloat64(num pgtype.Numeric) float64 {
	if !num.Valid {
		return 0
	}
	f8, err := num.Float64Value()
	if err != nil {
		return 0
	}
	return f8.Float64
}

func parseFloat64ToNumeric(f float64) pgtype.Numeric {
	num := pgtype.Numeric{}
	num.Scan(f)
	return num
}

// convertScheduledTime converts empty string to nil for JSON response
func convertScheduledTime(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// convertActualCost converts 0 to nil for JSON response
func convertActualCost(f float64) *float64 {
	if f == 0 {
		return nil
	}
	return &f
}

// toInt32Ptr converts int32 to *int32
func toInt32Ptr(v int32) *int32 {
	return &v
}
