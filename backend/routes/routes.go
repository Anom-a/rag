package routes

import (
	"Rag/config"
	"Rag/controllers"
	"Rag/middleware"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetUpRouter(col *mongo.Collection, cfg config.AppConfig) *gin.Engine {
	r := gin.Default()
	ctrl := controllers.NewController(col, cfg)
	authCtrl := controllers.NewAuthController(cfg)

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
	r.POST("/auth/login", middleware.RequestSizeLimit(cfg), authCtrl.Login)

	api := r.Group("/api")
	api.Use(middleware.RequireAdminToken(cfg), middleware.RequestSizeLimit(cfg))
	api.POST("/documents", ctrl.CreateDocument)
	api.POST("/search", ctrl.Search)
	api.POST("/chat", middleware.ChatRateLimitPerIP(cfg.ChatRateLimit, time.Duration(cfg.ChatRateWindow)*time.Second), ctrl.Generate)

	r.Static("/", "./static")
	return r
}
