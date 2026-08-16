package main

import (
	"context"
	"fmt"
	"log"
	"github.com/Anom-a/rag/config"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/bson"
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

	count, err := collection.CountDocuments(context.Background(), bson.M{})
	if err != nil {
		log.Fatal("Count error: ", err)
	}
	fmt.Printf("Total documents in collection: %d\n", count)
	
	if count > 0 {
		cursor, err := collection.Find(context.Background(), bson.M{})
		if err != nil {
			log.Fatal(err)
		}
		defer cursor.Close(context.Background())
		var results []bson.M
		if err := cursor.All(context.Background(), &results); err != nil {
			log.Fatal(err)
		}
		for i, r := range results {
			emb, ok := r["embedding"].(bson.A)
			embLen := 0
			if ok {
				embLen = len(emb)
			}
			fmt.Printf("Doc %d: textLen=%v embLen=%v\n", i, len(fmt.Sprint(r["text"])), embLen)
		}
	}
}
