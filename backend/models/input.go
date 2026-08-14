package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Content struct {
	Text string `json:"text" binding:"required"`
}

type Model struct {
	ID        primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Text      string             `json:"text" bson:"text"`
	Embedding []float64          `json:"embedding" bson:"embedding"`
}
type Chunk struct {
	Text      string    `bson:"text" json:"text"`
	Embedding []float64 `bson:"embedding" json:"embedding"`
	Score     float64   `bson:"score,omitempty" json:"score,omitempty"`
	SourceID  string    `bson:"source_id,omitempty" json:"source_id,omitempty"`
}
