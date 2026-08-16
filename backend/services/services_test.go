package services

import (
	"github.com/Anom-a/rag/config"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGenerateFromChunksStreaming(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Write([]byte("data: {\"choices\": [{\"delta\": {\"content\": \"hello\"}}]}\n\n"))
		w.Write([]byte("data: {\"choices\": [{\"delta\": {\"content\": \" world\"}}]}\n\n"))
	}))
	defer ts.Close()

	cfg := config.AppConfig{
		LLMModel:       "test-model",
		GroqBaseURL:    ts.URL,
		GroqAPIKey:     "fake",
		HTTPTimeoutSec: 5,
	}

	body, err := GenerateFromChunks(cfg, "system", "user query", []string{"chunk1"}, nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	defer body.Close()

	out, err := io.ReadAll(body)
	if err != nil {
		t.Fatalf("failed to read body: %v", err)
	}

	expected := `data: {"choices": [{"delta": {"content": "hello"}}]}

data: {"choices": [{"delta": {"content": " world"}}]}

`
	if string(out) != expected {
		t.Errorf("expected %q, got %q", expected, string(out))
	}
}
