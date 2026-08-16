package main

import (
	"fmt"
	"net/http"
)

func main() {
	res, err := http.Get("https://api.groq.com/openai/v1/models")
	if err != nil {
		fmt.Println("Groq Error:", err)
	} else {
		fmt.Println("Groq Status:", res.StatusCode)
		res.Body.Close()
	}

	res2, err := http.Get("https://api.voyageai.com/v1/embeddings")
	if err != nil {
		fmt.Println("Voyage Error:", err)
	} else {
		fmt.Println("Voyage Status:", res2.StatusCode)
		res2.Body.Close()
	}
}
