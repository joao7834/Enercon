package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	models "github.com/joao7834/IOT_Project/backEnd/Middleware/models"
)

type DeviceState struct {
	Bloqueado     bool
	TempoBloqueio time.Time
}

var (
	mu           sync.Mutex
	deviceStates = make(map[string]*DeviceState)
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

		mu.Lock()
		state, exists := deviceStates[tel.EspID]
		if !exists {
			state = &DeviceState{Bloqueado: false}
			deviceStates[tel.EspID] = state
		}

		const L_COR float32 = 9.0
		const cooldownTime = 10 * time.Second // Tempo de espera para o rearm automático

		var response models.Resposta

		if state.Bloqueado {
			if time.Since(state.TempoBloqueio) >= cooldownTime && tel.Corrente < L_COR {
				state.Bloqueado = false
				response.CortarRele = false
				response.Status = "OK - REARMADO AUTOMATICAMENTE"
				log.Printf("--> [ESP32 %s]: Cooldown encerrado e carga removida. Sistema rearmado!\n", tel.EspID)
			} else {
				response.CortarRele = true
				response.Status = "SOBRECARGA - BLOQUEADO"
			}
		} else {
			if tel.Corrente >= L_COR {
				state.Bloqueado = true
				state.TempoBloqueio = time.Now()
				response.CortarRele = true
				response.Status = "SOBRECARGA DETECTADA"
				log.Printf("--> [ESP32 %s]: SOBRECARGA! Cortando relé...\n", tel.EspID)
			} else {
				response.CortarRele = false
				response.Status = "OK"
			}
		}
		mu.Unlock()

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}
