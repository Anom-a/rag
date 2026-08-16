package middleware

import (
	"github.com/Anom-a/rag/config"
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type adminTokenPayload struct {
	Sub string `json:"sub"`
	Iat int64  `json:"iat"`
	Exp int64  `json:"exp"`
}

func ValidateAdminCredentials(cfg config.AppConfig, username, password string) bool {
	userOK := subtle.ConstantTimeCompare([]byte(username), []byte(cfg.AdminUsername)) == 1
	passOK := subtle.ConstantTimeCompare([]byte(password), []byte(cfg.AdminPassword)) == 1
	return userOK && passOK
}

func GenerateAdminToken(secret string, ttl time.Duration, now time.Time) (string, error) {
	p := adminTokenPayload{
		Sub: "admin",
		Iat: now.Unix(),
		Exp: now.Add(ttl).Unix(),
	}
	b, err := json.Marshal(p)
	if err != nil {
		return "", err
	}
	body := base64.RawURLEncoding.EncodeToString(b)
	sig := signTokenPart(secret, body)
	return body + "." + sig, nil
}

func VerifyAdminToken(secret, token string, now time.Time) error {
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return errors.New("invalid token format")
	}
	body, sig := parts[0], parts[1]
	expectedSig := signTokenPart(secret, body)
	if subtle.ConstantTimeCompare([]byte(sig), []byte(expectedSig)) != 1 {
		return errors.New("invalid token signature")
	}

	raw, err := base64.RawURLEncoding.DecodeString(body)
	if err != nil {
		return errors.New("invalid token payload")
	}
	var payload adminTokenPayload
	if err := json.Unmarshal(raw, &payload); err != nil {
		return errors.New("invalid token json")
	}
	if payload.Sub != "admin" {
		return errors.New("invalid token subject")
	}
	if payload.Exp <= now.Unix() {
		return errors.New("token expired")
	}

	return nil
}

func signTokenPart(secret, body string) string {
	h := hmac.New(sha256.New, []byte(secret))
	_, _ = h.Write([]byte(body))
	return base64.RawURLEncoding.EncodeToString(h.Sum(nil))
}

func RequireAdminToken(cfg config.AppConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing bearer token"})
			return
		}
		token := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))

		if err := VerifyAdminToken(cfg.AdminTokenKey, token, time.Now()); err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		c.Next()
	}
}
