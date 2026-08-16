package services

import (
	"github.com/Anom-a/rag/config"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}
type ChatRequest struct {
	Model    string        `json:"model"`
	Messages []ChatMessage `json:"messages"`
	Stream   bool          `json:"stream,omitempty"`
}
type ChatResponseChoices struct {
	Message ChatMessage `json:"message"`
}
type ChatResponse struct {
	Choices []ChatResponseChoices `json:"choices"`
}

type BadRequestError struct {
	Message string
}

func (e *BadRequestError) Error() string {
	return e.Message
}

func GetEmbedding(cfg config.AppConfig, text string) ([]float64, error) {
	if strings.TrimSpace(text) == "" {
		return nil, &BadRequestError{Message: "text cannot be empty"}
	}
	if len(text) > 10000 {
		return nil, &BadRequestError{Message: "text is too long"}
	}

	reqBody := map[string]interface{}{
		"input": text,
		"model": cfg.EmbeddingModel,
	}
	b, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequest("POST", cfg.EmbeddingEndpoint, bytes.NewReader(b))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+cfg.EmbeddingAPIKey)
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: time.Second * time.Duration(cfg.HTTPTimeoutSec)}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("voyage api error: %v", string(body))
	}
	var wrapper struct {
		Data []struct {
			Embedding []float64 `json:"embedding"`
		}
	}
	if err := json.Unmarshal(body, &wrapper); err != nil {
		return nil, err
	}
	if len(wrapper.Data) > 0 {
		return wrapper.Data[0].Embedding, nil
	}
	return nil, errors.New("no embedding found")

}

func CompactChatHistory(history []ChatMessage, userQuestion string, maxMessages int, maxChars int) []ChatMessage {
	if maxMessages < 1 {
		maxMessages = 1
	}
	if maxChars < 500 {
		maxChars = 500
	}

	clean := make([]ChatMessage, 0, len(history))
	for _, m := range history {
		role := strings.ToLower(strings.TrimSpace(m.Role))
		if role != "user" && role != "assistant" {
			continue
		}
		content := strings.TrimSpace(m.Content)
		if content == "" {
			continue
		}
		clean = append(clean, ChatMessage{Role: role, Content: content})
	}

	questionLen := len(strings.TrimSpace(userQuestion))
	dynamicBudget := maxChars - questionLen - 200
	if dynamicBudget < 300 {
		dynamicBudget = 300
	}

	keptReversed := make([]ChatMessage, 0, maxMessages)
	used := 0
	for i := len(clean) - 1; i >= 0; i-- {
		m := clean[i]
		itemCost := len(m.Content) + 8
		if len(keptReversed) >= maxMessages || used+itemCost > dynamicBudget {
			continue
		}
		keptReversed = append(keptReversed, m)
		used += itemCost
	}

	kept := make([]ChatMessage, 0, len(keptReversed)+1)
	for i := len(keptReversed) - 1; i >= 0; i-- {
		kept = append(kept, keptReversed[i])
	}

	omittedCount := len(clean) - len(kept)
	if omittedCount > 0 {
		summaryParts := make([]string, 0, omittedCount)
		for i := 0; i < len(clean) && len(summaryParts) < 6; i++ {
			msg := clean[i]
			if containsMessage(kept, msg) {
				continue
			}
			part := msg.Role + ": " + msg.Content
			if len(part) > 140 {
				part = part[:140] + "..."
			}
			summaryParts = append(summaryParts, part)
		}
		if len(summaryParts) > 0 {
			summary := "Previous conversation summary (auto-compacted): " + strings.Join(summaryParts, " | ")
			kept = append([]ChatMessage{{Role: "system", Content: summary}}, kept...)
		}
	}

	return kept
}

func containsMessage(set []ChatMessage, target ChatMessage) bool {
	for _, m := range set {
		if m.Role == target.Role && m.Content == target.Content {
			return true
		}
	}
	return false
}

func GenerateFromChunks(cfg config.AppConfig, systemPrompt string, userQuestion string, chunks []string, chatHistory []ChatMessage) (io.ReadCloser, error) {
	if strings.TrimSpace(userQuestion) == "" {
		return nil, &BadRequestError{Message: "query cannot be empty"}
	}

	var buf bytes.Buffer
	buf.WriteString(systemPrompt)
	buf.WriteString("\n\nContext:\n")
	const maxChunkChars = 1200
	const maxTotalContextChars = 12000
	total := 0
	for i, c := range chunks {
		clean := strings.TrimSpace(c)
		if clean == "" {
			continue
		}
		if len(clean) > maxChunkChars {
			clean = clean[:maxChunkChars]
		}
		total += len(clean)
		if total > maxTotalContextChars {
			break
		}
		buf.WriteString(fmt.Sprintf("Chunk %d: %s\n", i+1, clean))
	}
	buf.WriteString("\nUser question: " + userQuestion)

	messages := []ChatMessage{{Role: "system", Content: buf.String()}}
	messages = append(messages, chatHistory...)
	messages = append(messages, ChatMessage{Role: "user", Content: userQuestion})

	reqBody := ChatRequest{Model: cfg.LLMModel, Messages: messages, Stream: true}

	b, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	finalURL := fmt.Sprintf("%s/chat/completions", cfg.GroqBaseURL)
	req, err := http.NewRequest("POST", finalURL, bytes.NewReader(b))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+cfg.GroqAPIKey)

	client := &http.Client{Timeout: time.Second * time.Duration(cfg.HTTPTimeoutSec)}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return nil, fmt.Errorf("groq provider returned status: %v: %v", resp.StatusCode, string(body))
	}

	return resp.Body, nil
}
