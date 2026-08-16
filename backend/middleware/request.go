package middleware

import (
	"github.com/Anom-a/rag/config"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RequestSizeLimit(cfg config.AppConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, cfg.MaxRequestBody)
		c.Next()
	}
}
