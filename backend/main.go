package main

import (
	"Rag/config"
	"Rag/routes"
	"log"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	cfg, err := config.LoadAppConfig()
	if err != nil {
		log.Fatal(err)
	}

	_, cancel, collection, err := config.ConnectMongo(cfg)
	if err != nil {
		log.Fatal(err)
	}
	defer cancel()
	r := routes.SetUpRouter(collection, cfg)
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)

	}
}
