package repositories

import (
	"github.com/Anom-a/rag/models"
	"context"
	"math"
	"sort"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func InsertModel(ctx context.Context, collection *mongo.Collection, m models.Model) error {
	_, err := collection.InsertOne(ctx, m)
	return err
}

func cosineSimilarity(a, b []float64) float64 {
	if len(a) != len(b) {
		return 0
	}
	var dotProduct, normA, normB float64
	for i := range a {
		dotProduct += a[i] * b[i]
		normA += a[i] * a[i]
		normB += b[i] * b[i]
	}
	if normA == 0 || normB == 0 {
		return 0
	}
	return dotProduct / (math.Sqrt(normA) * math.Sqrt(normB))
}

func FindModel(ctx context.Context, collection *mongo.Collection, emb []float64, limit int, minScore float64) ([]models.Chunk, error) {
	if limit < 1 {
		limit = 1
	}

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var allModels []models.Model
	if err := cursor.All(ctx, &allModels); err != nil {
		return nil, err
	}

	var chunks []models.Chunk
	for _, m := range allModels {
		score := cosineSimilarity(emb, m.Embedding)
		if score > minScore {
			chunks = append(chunks, models.Chunk{
				Text:      m.Text,
				Embedding: m.Embedding,
				Score:     score,
			})
		}
	}

	sort.Slice(chunks, func(i, j int) bool {
		return chunks[i].Score > chunks[j].Score
	})

	if len(chunks) > limit {
		chunks = chunks[:limit]
	}

	if chunks == nil {
		chunks = make([]models.Chunk, 0)
	}

	return chunks, nil
}
