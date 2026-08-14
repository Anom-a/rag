package middleware

import (
	"testing"
	"time"
)

func TestChatRateLimiterAllowAndReset(t *testing.T) {
	now := time.Unix(1_700_000_000, 0)
	clock := now
	lim := newChatRateLimiter(5, time.Minute, func() time.Time { return clock })

	ip := "10.0.0.1"
	for i := 1; i <= 5; i++ {
		ok, remaining, retry := lim.allow(ip)
		if !ok {
			t.Fatalf("expected allowed on request %d", i)
		}
		if retry != 0 {
			t.Fatalf("expected no retry when allowed")
		}
		expRemaining := 5 - i
		if remaining != expRemaining {
			t.Fatalf("expected remaining %d got %d", expRemaining, remaining)
		}
	}

	ok, _, retry := lim.allow(ip)
	if ok {
		t.Fatalf("expected blocked after limit")
	}
	if retry < 1 {
		t.Fatalf("expected positive retry-after")
	}

	clock = clock.Add(61 * time.Second)
	ok, remaining, retry := lim.allow(ip)
	if !ok || retry != 0 {
		t.Fatalf("expected allowed after window reset")
	}
	if remaining != 4 {
		t.Fatalf("expected remaining reset to 4 got %d", remaining)
	}
}

func TestChatRateLimiterIPIsolation(t *testing.T) {
	now := time.Unix(1_700_000_000, 0)
	lim := newChatRateLimiter(2, time.Minute, func() time.Time { return now })

	ok1, _, _ := lim.allow("ip-a")
	ok2, _, _ := lim.allow("ip-a")
	ok3, _, _ := lim.allow("ip-a")
	if !(ok1 && ok2) || ok3 {
		t.Fatalf("expected ip-a limited independently")
	}

	okB, _, _ := lim.allow("ip-b")
	if !okB {
		t.Fatalf("expected ip-b still allowed")
	}
}

func TestExtractClientIPMatrix(t *testing.T) {
	cases := []struct {
		in   string
		want string
	}{
		{"", "unknown"},
		{"   ", "unknown"},
		{"127.0.0.1", "127.0.0.1"},
		{"127.0.0.1:1234", "127.0.0.1"},
		{"::1", "::1"},
		{"[::1]:8080", "::1"},
		{"1.1.1.1, 2.2.2.2", "1.1.1.1"},
		{" 1.1.1.1 ,2.2.2.2", "1.1.1.1"},
		{"unknown", "unknown"},
		{"10.0.0.1:80, 10.0.0.2", "10.0.0.1"},
		{"255.255.255.255", "255.255.255.255"},
		{"0.0.0.0", "0.0.0.0"},
		{"example.com", "example.com"},
		{"example.com:443", "example.com"},
		{"[2001:db8::1]:443", "2001:db8::1"},
		{"2001:db8::1", "2001:db8::1"},
		{"1.2.3.4,", "1.2.3.4"},
		{",1.2.3.4", "unknown"},
		{"10.10.10.10:65535", "10.10.10.10"},
		{"hostname:1234", "hostname"},
		{"1.2.3.4:0", "1.2.3.4"},
		{"1.2.3.4:99999", "1.2.3.4"},
		{"x:y", "x"},
		{"1.2.3.4 , 5.6.7.8 , 9.9.9.9", "1.2.3.4"},
		{"\t1.2.3.4\t", "1.2.3.4"},
		{" [::1]:80 ", "::1"},
		{"localhost", "localhost"},
		{"localhost:3000", "localhost"},
		{"8.8.8.8:53", "8.8.8.8"},
		{"192.168.1.1", "192.168.1.1"},
	}

	for i, tc := range cases {
		t.Run("ip_case_"+intToString(i+1), func(t *testing.T) {
			got := extractClientIP(tc.in)
			if got != tc.want {
				t.Fatalf("input=%q want=%q got=%q", tc.in, tc.want, got)
			}
		})
	}
}
