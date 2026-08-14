package repositories

import (
	"Rag/models"
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func InsertModel(ctx context.Context, collection *mongo.Collection, m models.Model) error {
	_, err := collection.InsertOne(ctx, m)
	return err
}

func FindModel(ctx context.Context, collection *mongo.Collection, emb []float64, limit int, minScore float64) ([]models.Chunk, error) {
	if limit < 1 {
		limit = 1
	}

	numCandidates := limit * 25
	if numCandidates < 100 {
		numCandidates = 100
	}

	pipeline := mongo.Pipeline{
		bson.D{
			{Key: "$vectorSearch", Value: bson.D{
				{Key: "queryVector", Value: emb},
				{Key: "path", Value: "embedding"},
				{Key: "limit", Value: limit},
				{Key: "index", Value: "embedding"},
				{Key: "numCandidates", Value: numCandidates},
			}},
		},
		bson.D{
			{Key: "$project", Value: bson.D{
				{Key: "_id", Value: 0},
				{Key: "text", Value: 1},
				{Key: "embedding", Value: 1},
				{Key: "score", Value: bson.D{{Key: "$meta", Value: "vectorSearchScore"}}},
			}},
		},
		bson.D{{Key: "$match", Value: bson.D{
			{Key: "score", Value: bson.D{{Key: "$gt", Value: minScore}}},
		}}},
		bson.D{
			{Key: "$sort", Value: bson.D{
				{Key: "score", Value: -1},
			}},
		},
		bson.D{{Key: "$limit", Value: limit}},
	}
	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var res []models.Chunk
	if err := cursor.All(ctx, &res); err != nil {
		return nil, err
	}
	return res, nil
}
