package middleware

import (
	"Rag/config"
	"strings"
	"testing"
	"time"
)

func TestValidateAdminCredentialsMatrix(t *testing.T) {
	cfg := config.AppConfig{AdminUsername: "admin", AdminPassword: "secret"}
	cases := []struct {
		name string
		u    string
		p    string
		ok   bool
	}{
		{"exact_match", "admin", "secret", true},
		{"wrong_user", "root", "secret", false},
		{"wrong_pass", "admin", "bad", false},
		{"both_wrong", "root", "bad", false},
		{"case_user", "Admin", "secret", false},
		{"case_pass", "admin", "Secret", false},
		{"empty_user", "", "secret", false},
		{"empty_pass", "admin", "", false},
		{"spaces", " admin ", "secret", false},
		{"long_values", strings.Repeat("a", 100), strings.Repeat("b", 100), false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := ValidateAdminCredentials(cfg, tc.u, tc.p)
			if got != tc.ok {
				t.Fatalf("expected %v got %v", tc.ok, got)
			}
		})
	}
}

func TestGenerateAndVerifyAdminTokenValid(t *testing.T) {
	secret := "super-secret"
	now := time.Unix(1_700_000_000, 0)
	tok, err := GenerateAdminToken(secret, 30*time.Minute, now)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if err := VerifyAdminToken(secret, tok, now.Add(5*time.Minute)); err != nil {
		t.Fatalf("expected valid token, got error: %v", err)
	}
}

func TestVerifyAdminTokenFailures(t *testing.T) {
	secret := "super-secret"
	now := time.Unix(1_700_000_000, 0)
	baseToken, err := GenerateAdminToken(secret, 10*time.Minute, now)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	tampered := []string{}
	parts := strings.Split(baseToken, ".")
	if len(parts) != 2 {
		t.Fatalf("expected 2 parts token")
	}
	tampered = append(tampered,
		"",
		"no-dot-token",
		parts[0]+".",
		"."+parts[1],
		parts[0]+"."+parts[1]+".extra",
		parts[0]+"."+parts[1]+"x",
		parts[0]+"x."+parts[1],
	)


	for i, tok := range tampered {
		t.Run("bad_token_case_"+intToString(i), func(t *testing.T) {
			if err := VerifyAdminToken(secret, tok, now.Add(5*time.Minute)); err == nil {
				t.Fatalf("expected error for token case %d", i)
			}
		})
	}
}

func TestVerifyAdminTokenExpiryVariants(t *testing.T) {
	secret := "super-secret"
	now := time.Unix(1_700_000_000, 0)

	for i := 1; i <= 25; i++ {
		t.Run("expiry_case_"+intToString(i), func(t *testing.T) {
			ttl := time.Duration(i) * time.Minute
			tok, err := GenerateAdminToken(secret, ttl, now)
			if err != nil {
				t.Fatalf("unexpected generate error: %v", err)
			}
			if err := VerifyAdminToken(secret, tok, now.Add(ttl-time.Second)); err != nil {
				t.Fatalf("expected token valid before expiry: %v", err)
			}
			if err := VerifyAdminToken(secret, tok, now.Add(ttl)); err == nil {
				t.Fatalf("expected token expired at boundary")
			}
		})
	}
}
