package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	models "github.com/joao7834/IOT_Project/backEnd/Middleware/models"
)

func TelHandler(telemetriaChan chan<- models.Telemetria) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if r.Method != http.MethodPost {
			http.Error(w, "ERRO 405! MÉTODO NÃO PERMITIDO", http.StatusMethodNotAllowed)
			return
		}

		var tel models.Telemetria
		err := json.NewDecoder(r.Body).Decode(&tel)
		if err != nil {
			log.Println("Error detected")
			http.Error(w, "Error detected... status bad request", http.StatusBadRequest)
			return
		}

		if tel.EspID == "" {
			log.Println("Error detected")
			http.Error(w, "Error detected... ESP32 without ID", http.StatusBadRequest)
			return
		}
		telemetriaChan <- tel
		go InviteJava(tel)

		log.Printf("Telemetria recebida (ESP32 %s): Temp=%.1f°C | Umid=%.1f%% | Corr=%.2fA | Pot=%.1fW\n", tel.EspID, tel.Temperatura, tel.Umidade, tel.Corrente, tel.Potencia)

		var response models.Resposta
		const L_COR float32 = 7.0
		if tel.Corrente >= L_COR {
			response.CortarRele = true
			response.Status = "SOBRECARGA DETECTADA"
		} else {
			response.CortarRele = false
			response.Status = "OK"
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)

	}
}
