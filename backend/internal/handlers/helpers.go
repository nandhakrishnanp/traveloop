package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// parseDate parses a date string in YYYY-MM-DD format
func parseDate(dateStr string) (time.Time, error) {
	return time.Parse("2006-01-02", dateStr)
}

// mustParseDate parses a date string and panics on error
// Should only be called after validation with parseDate
func mustParseDate(dateStr string) time.Time {
	t, _ := time.Parse("2006-01-02", dateStr)
	return t
}

// Error response helpers

// ErrorResponse represents a standard error response
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
	Code    int    `json:"code"`
}

// RespondError sends a standard error response
func RespondError(c *gin.Context, statusCode int, errorCode string, message string) {
	c.JSON(statusCode, ErrorResponse{
		Error:   errorCode,
		Message: message,
		Code:    statusCode,
	})
}

// RespondBadRequest sends a 400 Bad Request error
func RespondBadRequest(c *gin.Context, message string) {
	RespondError(c, http.StatusBadRequest, "bad_request", message)
}

// RespondUnauthorized sends a 401 Unauthorized error
func RespondUnauthorized(c *gin.Context, message string) {
	RespondError(c, http.StatusUnauthorized, "unauthorized", message)
}

// RespondForbidden sends a 403 Forbidden error
func RespondForbidden(c *gin.Context, message string) {
	RespondError(c, http.StatusForbidden, "forbidden", message)
}

// RespondNotFound sends a 404 Not Found error
func RespondNotFound(c *gin.Context, message string) {
	RespondError(c, http.StatusNotFound, "not_found", message)
}

// RespondConflict sends a 409 Conflict error
func RespondConflict(c *gin.Context, message string) {
	RespondError(c, http.StatusConflict, "conflict", message)
}

// RespondInternalError sends a 500 Internal Server Error
func RespondInternalError(c *gin.Context, message string) {
	RespondError(c, http.StatusInternalServerError, "internal_error", message)
}
