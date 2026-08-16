package main

import (
	"context"
	"fmt"
	"time"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func main() {
	uri := "mongodb+srv://anomabebe639_db_user:2eiUSUmFHSWihutq@cluster0.cdtzrqt.mongodb.net"
	clientOpt := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(clientOpt)
	if err != nil {
		fmt.Println("Connect error:", err)
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err = client.Ping(ctx, nil)
	if err != nil {
		fmt.Println("Ping error:", err)
		return
	}
	fmt.Println("Mongo connected successfully")
}
