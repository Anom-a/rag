package main

import (
	"context"
	"fmt"
	"log"
	"github.com/Anom-a/rag/config"
	"github.com/Anom-a/rag/repositories"
	"github.com/Anom-a/rag/services"
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

	emb, err := services.GetEmbedding(cfg, "when was ethiorobotics founded")
	if err != nil {
		log.Fatal(err)
	}

	chunks, err := repositories.FindModel(context.Background(), collection, emb, 5, cfg.MinScore)
	if err != nil {
		log.Fatal("FindModel error: ", err)
	}

	fmt.Printf("Found %d results\n", len(chunks))
	for i, c := range chunks {
		fmt.Printf("Result %d: Score=%v Text=%v\n", i, c.Score, c.Text)
	}
}
