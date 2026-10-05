package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	models "github.com/joao7834/IOT_Project/backEnd/Middleware/models"
)

func InviteJava(jsonTel models.Telemetria) {
	jsonData, err := json.Marshal(jsonTel)
	if err != nil {
		log.Printf("Não foi possível converter os dados para json!")
	}
	url := "http://localhost:4039/javanauta"

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Falha ao fazer a requisição ao cliente java!")
		return
	}

	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode < 200 || resp.StatusCode >= 350 {
		log.Printf("Servidor java retornou erro HTTP %d: %s", resp.StatusCode, string(body))
	}
	fmt.Printf("Sucesso ao enviar os dados ao servidor java! Resposta: %s", string(body))
}
