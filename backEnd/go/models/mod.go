package models

type Telemetria struct {
	Corrente    float32 `json:"corrente"`
	Potencia    float32 `json:"potencia"`
	Temperatura float32 `json:"temperatura"`
	Umidade     float32 `json:"umidade"`
	EspID       float32 `json:"espID"`
}

type Resposta struct {
	Status     string `json:"status"`
	CortarRele bool   `json:"cortar_rele"`
}
