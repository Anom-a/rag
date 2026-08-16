package main

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"

	"github.com/Anom-a/rag/services"
)

func main() {
	// 1. Create a dummy test file
	err := os.WriteFile("test.txt", []byte("Hello this is a test text file for RAG upload."), 0644)
	if err != nil {
		log.Fatal(err)
	}
	defer os.Remove("test.txt")

	// 2. Create a multipart form request in memory to generate a *multipart.FileHeader
	var b bytes.Buffer
	w := multipart.NewWriter(&b)
	fw, err := w.CreateFormFile("file", "test.txt")
	if err != nil {
		log.Fatal(err)
	}
	f, err := os.Open("test.txt")
	if err != nil {
		log.Fatal(err)
	}
	io.Copy(fw, f)
	f.Close()
	w.Close()

	req, _ := http.NewRequest("POST", "/", &b)
	req.Header.Set("Content-Type", w.FormDataContentType())
	
	// Parse the multipart form
	err = req.ParseMultipartForm(10 << 20)
	if err != nil {
		log.Fatal(err)
	}

	fileHeader := req.MultipartForm.File["file"][0]

	// 3. Test our ExtractText function
	text, err := services.ExtractText(fileHeader)
	if err != nil {
		log.Fatal("Extraction failed:", err)
	}

	fmt.Printf("Extraction successful! Text: %s\n", text)
}
