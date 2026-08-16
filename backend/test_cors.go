package main

import (
	"fmt"
	"github.com/gin-contrib/cors"
)

func main() {
	cfg := cors.DefaultConfig()
	fmt.Printf("Headers: %v\n", cfg.AllowHeaders)
}
