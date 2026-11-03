# ⚡ Sistema de Monitoramento Energético e Ambiental com ESP32

Projeto desenvolvido em **C++**, **Golang**, **Java** e **JS**, com foco na leitura de consumo elétrico residencial (via sensor ACS712) e variáveis ambientais (DHT22), exibindo os dados em tempo real em um Display OLED SSD1306 e com proteção contra sobrecarga via Módulo Relé.

---

## 🛠️ Componentes Utilizados

| Componente | Função no Projeto | Pino no ESP32 |
| :--- | :--- | :--- |
| **ESP32 DevKit V1** | Microcontrolador Principal | - |
| **Display OLED SSD1306 (I2C)** | Interface gráfica de exibição dos dados | SDA (`GPIO 21`) / SCL (`GPIO 22`) |
| **Sensor DHT22** | Leitura de Temperatura e Umidade | Data (`GPIO 15`) |
| **Potenciômetro** | Simulação de Corrente Elétrica (ACS712) | Signal (`GPIO 34`) |
| **Módulo Relé (1 Canal)** | Atua como Disjuntor Eletrônico de Segurança | Control (`GPIO 18`) |
| **Protoboard & Jumper Wires** | Interconexão e distribuição de energia | - |

---

## 📋 Lógica de Funcionamento

1. **Medição de Corrente/Potência:** A entrada analógica (`GPIO 34`) mapeia a variação de $0\text{V}$ a $3.3\text{V}$ para uma escala simulada de $0.0\text{A}$ a $10.0\text{A}$ RMS. A potência é calculada com base na rede de $127\text{V}$ ($P = V \times I$).
2. **Monitoramento Ambiental:** O DHT22 faz a leitura contínua de temperatura ($^\circ\text{C}$) e umidade ($\%$).
3. **Proteção Automática (Disjuntor):** Caso a corrente medida ultrapasse o limite configurado de **$7.0\text{A}$**, o ESP32 aciona o Módulo Relé para desligar a carga e exibe um alerta de `SOBRECARGA AC` no display.

---

## 📚 Bibliotecas Necessárias (Arduino IDE / Wokwi)

* `Adafruit SSD1306`
* `Adafruit GFX Library`
* `DHT sensor library`
* `Wire` (Nativa)

---

## 🚀 Como Executar o Projeto

1. Abra o código contido na pasta `src/main.ino` dentro da **Arduino IDE** ou **Wokwi**.
2. Instale as bibliotecas listadas acima através do Library Manager.
3. [Clique aqui para acessar a simulação interativa no Wokwi](https://wokwi.com/projects/473257740043417601
   ).

---

## Andamento

O projeto atual está em constante evolução, com cada um dos membros fazendo o seguinte papel:
1. João: Elaboração do código em .ino, para o funcionamento da esp32, juntamente da elaboração da API Rest, arquitetada em Golang, com aplicações full stack em front-end.
2. Davi Ciriaco Napoli: Aplicação de Servidor modelo Rest para a comunicação entre as vertentes BackEnd e FrontEnd do Projeto, participação na página principal do projeto e o encapsulamento de seus dados para uma maior segurança de dados.
