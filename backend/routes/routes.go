package routes

import (
	"github.com/Anom-a/rag/config"
	"github.com/Anom-a/rag/controllers"
	"github.com/Anom-a/rag/middleware"
	"time"

	"github.com/gin-contrib/static"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func SetUpRouter(col *mongo.Collection, cfg config.AppConfig) *gin.Engine {
	r := gin.Default()
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(corsConfig))
	ctrl := controllers.NewController(col, cfg)
	authCtrl := controllers.NewAuthController(cfg)

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
	r.POST("/auth/login", middleware.RequestSizeLimit(cfg), authCtrl.Login)

	api := r.Group("/api")
	api.Use(middleware.RequestSizeLimit(cfg))

	// Authenticated endpoints
	admin := api.Group("/")
	admin.Use(middleware.RequireAdminToken(cfg))
	admin.POST("/documents", ctrl.CreateDocument)
	admin.POST("/upload", ctrl.UploadDocument)

	// Unauthenticated endpoints
	api.POST("/search", ctrl.Search)
	api.POST("/chat", middleware.ChatRateLimitPerIP(cfg.ChatRateLimit, time.Duration(cfg.ChatRateWindow)*time.Second), ctrl.Generate)

	r.Use(static.Serve("/", static.LocalFile("./static", false)))
	return r
}
