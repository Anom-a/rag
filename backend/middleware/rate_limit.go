package middleware

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type ipWindowCounter struct {
	Count       int
	WindowStart time.Time
}

type chatRateLimiter struct {
	mu      sync.Mutex
	limit   int
	window  time.Duration
	buckets map[string]ipWindowCounter
	nowFn   func() time.Time
}

func newChatRateLimiter(limit int, window time.Duration, nowFn func() time.Time) *chatRateLimiter {
	if nowFn == nil {
		nowFn = time.Now
	}
	return &chatRateLimiter{
		limit:   limit,
		window:  window,
		buckets: make(map[string]ipWindowCounter),
		nowFn:   nowFn,
	}
}

func (r *chatRateLimiter) allow(ip string) (bool, int, int64) {
	now := r.nowFn()
	r.mu.Lock()
	defer r.mu.Unlock()

	entry, ok := r.buckets[ip]
	if !ok || now.Sub(entry.WindowStart) >= r.window {
		entry = ipWindowCounter{Count: 0, WindowStart: now}
	}

	entry.Count++
	r.buckets[ip] = entry

	remaining := r.limit - entry.Count
	if remaining < 0 {
		remaining = 0
	}
	retryAfter := int64(0)
	if entry.Count > r.limit {
		retryAfter = int64(r.window.Seconds() - now.Sub(entry.WindowStart).Seconds())
		if retryAfter < 1 {
			retryAfter = 1
		}
		return false, remaining, retryAfter
	}
	return true, remaining, retryAfter
}

func ChatRateLimitPerIP(limit int, window time.Duration) gin.HandlerFunc {
	limiter := newChatRateLimiter(limit, window, nil)
	return func(c *gin.Context) {
		ip := extractClientIP(c.ClientIP())
		allowed, remaining, retryAfter := limiter.allow(ip)
		c.Header("X-RateLimit-Limit", intToString(limit))
		c.Header("X-RateLimit-Remaining", intToString(remaining))
		if !allowed {
			c.Header("Retry-After", intToString64(retryAfter))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "chat rate limit exceeded"})
			return
		}
		c.Next()
	}
}

func extractClientIP(raw string) string {
	v := strings.TrimSpace(raw)
	if v == "" {
		return "unknown"
	}
	if strings.Contains(v, ",") {
		parts := strings.Split(v, ",")
		v = strings.TrimSpace(parts[0])
	}
	host, _, err := net.SplitHostPort(v)
	if err == nil {
		v = host
	}
	if v == "" {
		return "unknown"
	}
	return v
}

func intToString(n int) string {
	return intToString64(int64(n))
}

func intToString64(n int64) string {
	if n == 0 {
		return "0"
	}
	neg := false
	if n < 0 {
		neg = true
		n = -n
	}
	buf := make([]byte, 0, 20)
	for n > 0 {
		d := n % 10
		buf = append([]byte{byte('0' + d)}, buf...)
		n = n / 10
	}
	if neg {
		buf = append([]byte{'-'}, buf...)
	}
	return string(buf)
}
