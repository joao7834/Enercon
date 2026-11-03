package handlers

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"

	models "github.com/joao7834/IOT_Project/backEnd/Middleware/models"
)

func JavaHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var dados map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&dados)
	if err != nil {
		log.Printf("Erro ao decodificar JSON do Java: %v", err)
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	log.Printf("--> [EVENTO JAVA RECEBIDO]: %+v\n", dados)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Go recebeu a informação com sucesso!"))
}

func getJava(tel models.Telemetria) {
	jsonJava, err := json.Marshal(tel)
	if err != nil {
		log.Printf("Não foi possível empacotar o pacote em JSON! [%s]", err)
		return
	}

	url := "http://localhost:8081/javaA"
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonJava))
	if err != nil {
		log.Printf("O servidor java está indisponível no momento. [%s]", err)
		return
	}
	defer resp.Body.Close()
}
