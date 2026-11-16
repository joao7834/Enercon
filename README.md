# Enercon — Sistema de Controle e Telemetria Energética

> *"Monitoramento contínuo, preciso e eficiente de consumo elétrico com arquitetura distribuída."*

![C++](https://img.shields.io/badge/C%2B%2B-00599C?style=for-the-badge&logo=c%2B%2B&logoColor=white)
![ESP32](https://img.shields.io/badge/ESP32-E7352C?style=for-the-badge&logo=espressif&logoColor=white)
![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge)

---

## Sobre o Projeto

O **Enercon** é um sistema completo de telemetria e monitoramento de consumo energético em tempo real. O projeto adota uma arquitetura em camadas para capturar dados elétricos na borda (hardware), processá-los com alta concorrência e armazená-los de forma estruturada para visualização analítica:

- **ESP32 (C++):** Responsável pela aquisição de dados dos sensores de corrente e tensão, filtragem de ruído e envio de pacotes via Wi-Fi.
- **Go (Golang):** Atua como middleware de ingestão, utilizando concorrência nativa para receber, validar e rotear as requisições dos dispositivos sem gargalos.
- **Java:** Responsável pelo backend principal, gerenciamento das regras de negócio, cálculo de consumo consolidado (kWh) e integração com o banco de dados.
- **Frontend Web:** Interface gráfica para acompanhamento das métricas em tempo real e análise do histórico de gastos.

---

## Divisão do Desenvolvimento

- **Firmware (ESP32), Middleware em Go & Integração:** Desenvolvido por **[@JV74](https://github.com/joao7834)**
- **Backend em Java & Frontend:** Desenvolvido em colaboração com **[@FXVIZFF2](https://github.com/FXVIZFF2)**
- **Montagem Física & Modelagem / Impressão 3D:** Desenvolvido em colaboração com **[@gui27222](https://github.com/gui27222)**

---

## Funcionalidades

- **Telemetria em Tempo Real:** Leitura contínua de tensão (V), corrente (A) e potência ativa (W) diretamente pelo microcontrolador.
- **Ingestão de Alta Performance:** Middleware em Go preparado para lidar com múltiplos envios simultâneos e baixa latência.
- **Persistência Histórica:** Armazenamento estruturado no MySQL para consultas por período e análise de picos de demanda.
- **Dashboard Interativo:** Visualização clara das métricas instantâneas e do consumo acumulado no navegador.

---

## Tecnologias Utilizadas

- **C++ (.ino) & ESP32** — Firmware embarcado e leitura de sensores IoT.
- **Golang** — Middleware de ingestão, validação de payloads e roteamento concorrente.
- **Java** — Core backend, regras de negócio e exposição da API REST.
- **MySQL** — Banco de dados relacional para armazenamento das leituras.
- **HTML5, CSS3 & JavaScript (ES6+)** — Interface web e consumo dinâmico da API.

---

## Como Executar o Projeto

### Pré-requisitos
- **Go** (v1.27+)
- **Java JDK** (17 ou superior)
- **Node** (24.21+)
- **Arduino IDE** ou **PlatformIO** (para gravação no ESP32)
