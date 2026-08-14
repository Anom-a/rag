package controllers

import (
	"Rag/config"
	"Rag/middleware"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	Cfg config.AppConfig
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token     string `json:"token"`
	TokenType string `json:"token_type"`
	ExpiresIn int64  `json:"expires_in"`
}

func NewAuthController(cfg config.AppConfig) *AuthController {
	return &AuthController{Cfg: cfg}
}

func (a *AuthController) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.Username = strings.TrimSpace(req.Username)
	req.Password = strings.TrimSpace(req.Password)
	if req.Username == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "username and password are required"})
		return
	}

	if !middleware.ValidateAdminCredentials(a.Cfg, req.Username, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	now := time.Now().UTC()
	ttl := time.Duration(a.Cfg.AdminTokenTTL) * time.Minute
	token, err := middleware.GenerateAdminToken(a.Cfg.AdminTokenKey, ttl, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, LoginResponse{
		Token:     token,
		TokenType: "Bearer",
		ExpiresIn: int64(ttl.Seconds()),
	})
}
