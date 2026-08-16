package main

import (
	"github.com/Anom-a/rag/config"
	"github.com/Anom-a/rag/routes"
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
