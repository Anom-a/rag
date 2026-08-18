package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
)

type AppConfig struct {
	MongoURI        string
	MongoDatabase   string
	MongoCollection string

	AdminUsername string
	AdminPassword string
	AdminTokenKey  string
	AdminTokenTTL  int

	EmbeddingAPIKey   string
	EmbeddingEndpoint string
	EmbeddingModel    string

	GroqAPIKey     string
	GroqBaseURL    string
	LLMModel       string
	DefaultPrompt  string
	ChatTopK       int
	MinScore       float64
	HTTPTimeoutSec int
	MaxRequestBody int64
	ChatRateLimit  int
	ChatRateWindow int
	MaxHistoryMsgs int
	MaxHistoryChars int

	AllowPromptOverride bool
}

func LoadAppConfig() (AppConfig, error) {
	cfg := AppConfig{
		MongoURI:        strings.TrimSpace(os.Getenv("MONGO_URI")),
		MongoDatabase:   envOrDefault("MONGO_DB", "rag"),
		MongoCollection: envOrDefault("MONGO_COLLECTION", "models"),

		AdminUsername: strings.TrimSpace(os.Getenv("ADMIN_USERNAME")),
		AdminPassword: strings.TrimSpace(os.Getenv("ADMIN_PASSWORD")),
		AdminTokenKey: strings.TrimSpace(os.Getenv("ADMIN_TOKEN_SECRET")),
		AdminTokenTTL: envIntOrDefault("ADMIN_TOKEN_TTL_MINUTES", 60),

		EmbeddingAPIKey:   strings.TrimSpace(os.Getenv("EMBEDDING_API_KEY")),
		EmbeddingEndpoint: strings.TrimSpace(os.Getenv("EMBEDDING_ENDPOINT")),
		EmbeddingModel:    envOrDefault("EMBEDDING_MODEL", "voyage-large-2"),

		GroqAPIKey:    strings.TrimSpace(os.Getenv("GROQ_API_KEY")),
		GroqBaseURL:   strings.TrimRight(envOrDefault("GROQ_BASE_URL", "https://api.groq.com/openai/v1"), "/"),
		LLMModel:      envOrDefault("LLM_MODEL", "openai/gpt-oss-120b"),
		DefaultPrompt: envOrDefault("DEFAULT_SYSTEM_PROMPT", "You are a helpful assistant for our staff users. Use the retrieved context to answer the user question accurately."),

		ChatTopK:       envIntOrDefault("CHAT_TOP_K", 4),
		MinScore:       envFloatOrDefault("MIN_VECTOR_SCORE", 0.8),
		HTTPTimeoutSec: envIntOrDefault("HTTP_TIMEOUT_SECONDS", 30),
		MaxRequestBody: envInt64OrDefault("MAX_REQUEST_BODY_BYTES", 1_048_576),
		ChatRateLimit:  envIntOrDefault("CHAT_RATE_LIMIT_PER_MIN", 5),
		ChatRateWindow: envIntOrDefault("CHAT_RATE_WINDOW_SECONDS", 60),
		MaxHistoryMsgs: envIntOrDefault("CHAT_MAX_HISTORY_MESSAGES", 20),
		MaxHistoryChars: envIntOrDefault("CHAT_MAX_HISTORY_CHARS", 8000),

		AllowPromptOverride: envBoolOrDefault("ALLOW_PROMPT_OVERRIDE", false),
	}

	if cfg.MongoURI == "" {
		return AppConfig{}, errors.New("MONGO_URI is required")
	}
	if cfg.AdminUsername == "" || cfg.AdminPassword == "" {
		return AppConfig{}, errors.New("ADMIN_USERNAME and ADMIN_PASSWORD are required")
	}
	if cfg.AdminTokenKey == "" {
		return AppConfig{}, errors.New("ADMIN_TOKEN_SECRET is required")
	}
	if cfg.AdminTokenTTL < 5 || cfg.AdminTokenTTL > 1440 {
		return AppConfig{}, fmt.Errorf("ADMIN_TOKEN_TTL_MINUTES must be between 5 and 1440, got %d", cfg.AdminTokenTTL)
	}
	if cfg.EmbeddingAPIKey == "" || cfg.EmbeddingEndpoint == "" {
		return AppConfig{}, errors.New("EMBEDDING_API_KEY and EMBEDDING_ENDPOINT are required")
	}
	if cfg.GroqAPIKey == "" {
		return AppConfig{}, errors.New("GROQ_API_KEY is required")
	}
	if cfg.ChatTopK <= 0 || cfg.ChatTopK > 20 {
		return AppConfig{}, fmt.Errorf("CHAT_TOP_K must be between 1 and 20, got %d", cfg.ChatTopK)
	}
	if cfg.MinScore < 0 || cfg.MinScore > 1 {
		return AppConfig{}, fmt.Errorf("MIN_VECTOR_SCORE must be in [0,1], got %f", cfg.MinScore)
	}
	if cfg.HTTPTimeoutSec < 5 || cfg.HTTPTimeoutSec > 120 {
		return AppConfig{}, fmt.Errorf("HTTP_TIMEOUT_SECONDS must be between 5 and 120, got %d", cfg.HTTPTimeoutSec)
	}
	if cfg.MaxRequestBody < 1024 {
		return AppConfig{}, errors.New("MAX_REQUEST_BODY_BYTES must be >= 1024")
	}
	if cfg.ChatRateLimit < 1 || cfg.ChatRateLimit > 120 {
		return AppConfig{}, fmt.Errorf("CHAT_RATE_LIMIT_PER_MIN must be between 1 and 120, got %d", cfg.ChatRateLimit)
	}
	if cfg.ChatRateWindow < 10 || cfg.ChatRateWindow > 3600 {
		return AppConfig{}, fmt.Errorf("CHAT_RATE_WINDOW_SECONDS must be between 10 and 3600, got %d", cfg.ChatRateWindow)
	}
	if cfg.MaxHistoryMsgs < 1 || cfg.MaxHistoryMsgs > 200 {
		return AppConfig{}, fmt.Errorf("CHAT_MAX_HISTORY_MESSAGES must be between 1 and 200, got %d", cfg.MaxHistoryMsgs)
	}
	if cfg.MaxHistoryChars < 500 || cfg.MaxHistoryChars > 200000 {
		return AppConfig{}, fmt.Errorf("CHAT_MAX_HISTORY_CHARS must be between 500 and 200000, got %d", cfg.MaxHistoryChars)
	}

	return cfg, nil
}

func envOrDefault(key, fallback string) string {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	return v
}

func envIntOrDefault(key string, fallback int) int {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return fallback
	}
	return n
}

func envInt64OrDefault(key string, fallback int64) int64 {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	n, err := strconv.ParseInt(v, 10, 64)
	if err != nil {
		return fallback
	}
	return n
}

func envFloatOrDefault(key string, fallback float64) float64 {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	n, err := strconv.ParseFloat(v, 64)
	if err != nil {
		return fallback
	}
	return n
}

func envBoolOrDefault(key string, fallback bool) bool {
	v := strings.TrimSpace(strings.ToLower(os.Getenv(key)))
	if v == "" {
		return fallback
	}
	switch v {
	case "1", "true", "yes", "y", "on":
		return true
	case "0", "false", "no", "n", "off":
		return false
	default:
		return fallback
	}
}
