package services

import (
	"archive/zip"
	"bytes"
	"encoding/xml"
	"errors"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"

	"github.com/ledongthuc/pdf"
)

// ExtractText takes an uploaded multipart.File and extracts its text content
// based on the file extension (e.g. .txt, .md, .pdf, .docx).
func ExtractText(header *multipart.FileHeader) (string, error) {
	file, err := header.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))

	switch ext {
	case ".txt", ".md":
		b, err := io.ReadAll(file)
		if err != nil {
			return "", err
		}
		return string(b), nil
	case ".pdf":
		return parsePDF(file, header.Size)
	case ".docx":
		return parseDOCX(file, header.Size)
	default:
		return "", errors.New("unsupported file type: " + ext)
	}
}

func parsePDF(f multipart.File, size int64) (string, error) {
	reader, err := pdf.NewReader(f, size)
	if err != nil {
		return "", err
	}
	
	var buf bytes.Buffer
	b, err := reader.GetPlainText()
	if err != nil {
		return "", err
	}
	buf.ReadFrom(b)
	return buf.String(), nil
}

func parseDOCX(f multipart.File, size int64) (string, error) {
	reader, err := zip.NewReader(f, size)
	if err != nil {
		return "", err
	}

	for _, file := range reader.File {
		if file.Name == "word/document.xml" {
			rc, err := file.Open()
			if err != nil {
				return "", err
			}
			defer rc.Close()

			return extractXMLText(rc)
		}
	}
	return "", errors.New("invalid docx file: word/document.xml not found")
}

func extractXMLText(r io.Reader) (string, error) {
	decoder := xml.NewDecoder(r)
	var text strings.Builder
	inText := false

	for {
		t, err := decoder.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", err
		}

		switch se := t.(type) {
		case xml.StartElement:
			if se.Name.Local == "t" { // <w:t> is text node in docx
				inText = true
			}
		case xml.EndElement:
			if se.Name.Local == "t" {
				inText = false
				text.WriteString(" ")
			}
		case xml.CharData:
			if inText {
				text.Write(se)
			}
		}
	}

	return strings.TrimSpace(text.String()), nil
}
