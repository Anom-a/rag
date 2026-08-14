package middleware

import (
	"Rag/config"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RequestSizeLimit(cfg config.AppConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, cfg.MaxRequestBody)
		c.Next()
	}
}
