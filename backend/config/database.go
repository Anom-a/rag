package config

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func ConnectMongo(cfg AppConfig) (context.Context, context.CancelFunc, *mongo.Collection, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	url := cfg.MongoURI
	if url == "" {
		cancel()
		return nil, nil, nil, errors.New("url is empty")
	}
	clientOpt := options.Client().ApplyURI(url)
	client, err := mongo.Connect(clientOpt)
	if err != nil {
		return ctx, cancel, nil, err
	}
	collection := client.Database(cfg.MongoDatabase).Collection(cfg.MongoCollection)
	return ctx, cancel, collection, nil
}
