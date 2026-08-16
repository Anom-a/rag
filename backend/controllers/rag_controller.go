package controllers

import (
	"github.com/Anom-a/rag/config"
	"github.com/Anom-a/rag/models"
	"github.com/Anom-a/rag/repositories"
	"github.com/Anom-a/rag/services"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type Controller struct {
	Col *mongo.Collection
	Cfg config.AppConfig
}

type GenRequest struct {
	Query       string                 `json:"query" binding:"required"`
	TopK        int                    `json:"top_k,omitempty"`
	ChatHistory []services.ChatMessage `json:"chat_history,omitempty"`
}

func NewController(col *mongo.Collection, cfg config.AppConfig) *Controller {
	return &Controller{Col: col, Cfg: cfg}
}

func (ctrl *Controller) CreateDocument(c *gin.Context) {
	var in models.Content
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	in.Text = strings.TrimSpace(in.Text)
	if in.Text == "" || len(in.Text) > 10000 {
		c.JSON(400, gin.H{"error": "text must be between 1 and 10000 characters"})
		return
	}

	emb, err := services.GetEmbedding(ctrl.Cfg, in.Text)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	doc := models.Model{
		Text:      in.Text,
		Embedding: emb,
	}
	if err := repositories.InsertModel(c.Request.Context(), ctrl.Col, doc); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, gin.H{"status": "OK"})
}

func (ctrl *Controller) UploadDocument(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(400, gin.H{"error": "file is required"})
		return
	}

	text, err := services.ExtractText(file)
	if err != nil {
		c.JSON(400, gin.H{"error": "failed to extract text: " + err.Error()})
		return
	}

	text = strings.TrimSpace(text)
	if text == "" {
		c.JSON(400, gin.H{"error": "extracted text is empty"})
		return
	}

	if len(text) > 10000 {
		text = text[:10000] // truncate instead of failing, for better UX with long docs
	}

	emb, err := services.GetEmbedding(ctrl.Cfg, text)
	if err != nil {
		c.JSON(500, gin.H{"error": "embedding failed: " + err.Error()})
		return
	}

	doc := models.Model{
		Text:      text,
		Embedding: emb,
	}

	if err := repositories.InsertModel(c.Request.Context(), ctrl.Col, doc); err != nil {
		c.JSON(500, gin.H{"error": "failed to save to database: " + err.Error()})
		return
	}

	c.JSON(201, gin.H{"status": "OK", "message": "File uploaded and processed successfully"})
}

func (ctrl *Controller) Search(c *gin.Context) {
	var in models.Content
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	in.Text = strings.TrimSpace(in.Text)
	if in.Text == "" || len(in.Text) > 5000 {
		c.JSON(400, gin.H{"error": "text must be between 1 and 5000 characters"})
		return
	}

	emb, err := services.GetEmbedding(ctrl.Cfg, in.Text)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	document, err := repositories.FindModel(c.Request.Context(), ctrl.Col, emb, ctrl.Cfg.ChatTopK, ctrl.Cfg.MinScore)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": document})
}

func (ctrl *Controller) Generate(c *gin.Context) {
	var req GenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	req.Query = strings.TrimSpace(req.Query)
	if req.Query == "" || len(req.Query) > 5000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query must be between 1 and 5000 characters"})
		return
	}

	if req.TopK == 0 {
		req.TopK = ctrl.Cfg.ChatTopK
	}
	if req.TopK < 1 || req.TopK > 20 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "top_k must be between 1 and 20"})
		return
	}

	emb, err := services.GetEmbedding(ctrl.Cfg, req.Query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "embedding failed", "details": err.Error()})
		return
	}

	chunksFound, err := repositories.FindModel(c.Request.Context(), ctrl.Col, emb, req.TopK, ctrl.Cfg.MinScore)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "retrieval failed", "details": err.Error()})
		return
	}

	chunks := []string{}
	for _, ch := range chunksFound {
		if strings.TrimSpace(ch.Text) != "" {
			chunks = append(chunks, ch.Text)
		}
	}

	systemPrompt := ctrl.Cfg.DefaultPrompt
	if ctrl.Cfg.AllowPromptOverride {
		if requestPrompt := strings.TrimSpace(c.GetHeader("X-System-Prompt")); requestPrompt != "" {
			systemPrompt = requestPrompt
		}
	}
	if strings.TrimSpace(systemPrompt) == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DEFAULT_SYSTEM_PROMPT is empty"})
		return
	}

	compactedHistory := services.CompactChatHistory(req.ChatHistory, req.Query, ctrl.Cfg.MaxHistoryMsgs, ctrl.Cfg.MaxHistoryChars)

	bodyStream, err := services.GenerateFromChunks(ctrl.Cfg, systemPrompt, req.Query, chunks, compactedHistory)
	if err != nil {
		var badRequestErr *services.BadRequestError
		if errors.As(err, &badRequestErr) {
			c.JSON(http.StatusBadRequest, gin.H{"error": badRequestErr.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "llm generation failed", "details": err.Error()})
		return
	}
	// We don't defer bodyStream.Close() here because DataFromReader will close it.

	c.DataFromReader(http.StatusOK, -1, "text/event-stream", bodyStream, map[string]string{
		"Cache-Control": "no-cache",
		"Connection":    "keep-alive",
	})
}
