package services

import (
	"strconv"
	"strings"
	"testing"
)

func TestCompactChatHistoryRoleFiltering(t *testing.T) {
	history := []ChatMessage{
		{Role: "user", Content: "hi"},
		{Role: "assistant", Content: "hello"},
		{Role: "system", Content: "skip this"},
		{Role: "tool", Content: "skip this too"},
		{Role: "assistant", Content: ""},
	}
	out := CompactChatHistory(history, "q", 10, 2000)
	for _, m := range out {
		if m.Role != "user" && m.Role != "assistant" && m.Role != "system" {
			t.Fatalf("unexpected role in output: %s", m.Role)
		}
	}
}

func TestCompactChatHistoryBudgetCases(t *testing.T) {
	for i := 1; i <= 30; i++ {
		t.Run("budget_case_"+strconv.Itoa(i), func(t *testing.T) {
			msgs := make([]ChatMessage, 0, 50)
			for j := 0; j < 50; j++ {
				role := "user"
				if j%2 == 0 {
					role = "assistant"
				}
				msgs = append(msgs, ChatMessage{Role: role, Content: strings.Repeat("x", i*10)})
			}

			out := CompactChatHistory(msgs, strings.Repeat("q", i*3), 20, 3000)
			if len(out) == 0 {
				t.Fatalf("expected at least one compacted message")
			}
			if len(out) > 21 {
				t.Fatalf("expected <= 21 messages (with summary), got %d", len(out))
			}
		})
	}
}

func TestCompactChatHistoryNewestPreference(t *testing.T) {
	history := []ChatMessage{}
	for i := 1; i <= 15; i++ {
		history = append(history, ChatMessage{Role: "user", Content: "msg-" + strconv.Itoa(i)})
	}
	out := CompactChatHistory(history, "short question", 5, 3000)

	foundLatest := false
	for _, m := range out {
		if strings.Contains(m.Content, "msg-15") {
			foundLatest = true
			break
		}
	}
	if !foundLatest {
		t.Fatalf("expected latest messages to be kept")
	}
}

func TestCompactChatHistorySummaryGeneration(t *testing.T) {
	history := []ChatMessage{}
	for i := 1; i <= 40; i++ {
		role := "user"
		if i%2 == 0 {
			role = "assistant"
		}
		history = append(history, ChatMessage{Role: role, Content: "content-" + strconv.Itoa(i) + strings.Repeat("z", 40)})
	}

	out := CompactChatHistory(history, strings.Repeat("q", 100), 6, 800)
	if len(out) == 0 {
		t.Fatalf("expected compacted history")
	}
	if out[0].Role != "system" {
		t.Fatalf("expected synthetic summary system message at first position")
	}
	if !strings.Contains(out[0].Content, "auto-compacted") {
		t.Fatalf("expected summary marker in first message")
	}
}

func TestCompactChatHistoryEdgeCases(t *testing.T) {
	cases := []struct {
		name       string
		history    []ChatMessage
		question   string
		maxMsgs    int
		maxChars   int
		minOutSize int
	}{
		{"empty_history", nil, "q", 5, 1000, 0},
		{"tiny_limits", []ChatMessage{{Role: "user", Content: "a"}}, "q", 0, 10, 1},
		{"spaces", []ChatMessage{{Role: "user", Content: "   "}, {Role: "assistant", Content: "ok"}}, "q", 5, 1000, 1},
		{"long_question", []ChatMessage{{Role: "user", Content: strings.Repeat("a", 100)}}, strings.Repeat("q", 5000), 5, 1000, 1},
		{"invalid_roles_only", []ChatMessage{{Role: "tool", Content: "x"}}, "q", 5, 1000, 0},
	}

	for i := 0; i < 30; i++ {
		tc := cases[i%len(cases)]
		t.Run(tc.name+"_"+strconv.Itoa(i+1), func(t *testing.T) {
			out := CompactChatHistory(tc.history, tc.question, tc.maxMsgs, tc.maxChars)
			if len(out) < tc.minOutSize {
				t.Fatalf("expected at least %d messages, got %d", tc.minOutSize, len(out))
			}
		})
	}
}
