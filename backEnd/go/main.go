package main

import (
	"fmt"
	"net/http"

	handlers "github.com/joao7834/IOT_Project/backEnd/Middleware/handlers"
	"github.com/joao7834/IOT_Project/backEnd/Middleware/models"
)

func main() {
	telChan := make(chan models.Telemetria, 100)

	go func() {
		for tel := range telChan {
			fmt.Printf("Dado recebido na ESP32 [%s] na main! Temp: %.1f°C\n", tel.EspID, tel.Temperatura)
		}
	}()
	http.HandleFunc("/telemetria", handlers.TelHandler(telChan))
	http.HandleFunc("/api", handlers.JavaHandler)

	fmt.Println("Gateway Go rodando na porta 8080...")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		panic(err)
	}
}
