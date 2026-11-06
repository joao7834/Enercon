#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>

// Net
const char *SSID = "Wokwi-GUEST";
const char *PASS = "";

// Golang URL
const char *GO_API_URL = "http://10.244.200.253:8080/telemetria";

// ID Dinâmico da ESP32
String espID = "";

// Oled
const int SC_WD = 128; // Screen width
const int SC_HG = 64;  // Screen height
const int OL_RST = -1; // Oled Reset
Adafruit_SSD1306 display(SC_WD, SC_HG, &Wire, OL_RST);

// Pinos
const int P_ACS = 34;
const int P_DHT = 15;
const int P_RLY = 18;
const int P_SDA = 21;
const int P_SCL = 22;

// DHT
const int DHT_TYPE = DHT22;
DHT dht(P_DHT, DHT_TYPE);

const float R_TNS = 127.0; // Tensão simulada
const float L_COR = 7.0;   // Limite relay

// Configurações do ACS712
const float SENSIBILIDADE = 0.185; // 185 mV/A para o modelo de 10A (ou ajuste se o seu for 100mV/A)
float tenOFF = 2.50;               // Será calibrado dinamicamente no setup

unsigned long lSolic = 0;
const unsigned long DELAY_ENVIO = 3000; // Envia a cada 3s

void connect()
{
  Serial.print("Conectando-se ao WiFi");
  WiFi.begin(SSID, PASS);

  int trys = 0;

  while (WiFi.status() != WL_CONNECTED && trys < 20)
  {
    delay(500);
    Serial.print(".");
    trys++;
  }

  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.println("WiFi conectado com sucesso!");
    Serial.print("IP do ESP32: ");
    Serial.println(WiFi.localIP());
  }
  else
  {
    Serial.println("Falha na conexão WiFi!");
  }
}

// Função para calibrar o ponto zero (offset) do sensor ao iniciar
void calibrarACS()
{
  Serial.println("Calibrando o offset do ACS712 (mantenha sem carga)...");
  long soma = 0;
  int amostras = 500;
  
  for (int i = 0; i < amostras; i++)
  {
    soma += analogRead(P_ACS);
    delay(2);
  }
  
  float rawMedio = (float)soma / amostras;
  float tenPin = (rawMedio / 4095.0) * 3.3;
  tenOFF = tenPin * 1.5; // Considera o divisor de tensão na entrada
  
  Serial.print("Offset calibrado com sucesso! tenOFF = ");
  Serial.println(tenOFF, 3);
}

void goSolic(float cor, float potn, float temp, float umid)
{
  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("WiFi desconectado! Tentando reconectar...");
    connect();
    return;
  }

  HTTPClient http;
  http.begin(GO_API_URL);
  http.addHeader("Content-Type", "application/json");

  String jsonPayload = "{";
  jsonPayload += "\"corrente\":" + String(cor, 2) + ",";
  jsonPayload += "\"potencia\":" + String(potn, 1) + ",";
  jsonPayload += "\"temperatura\":" + String(temp, 1) + ",";
  jsonPayload += "\"umidade\":" + String(umid, 1) + ",";
  jsonPayload += "\"espID\":\"" + espID + "\"";
  jsonPayload += "}";

  Serial.print("Enviando para o Go: ");
  Serial.println(jsonPayload);

  int httpCode = http.POST(jsonPayload);

  if (httpCode > 0)
  {
    String resGo = http.getString();
    Serial.print("HTTP Code Go: ");
    Serial.println(httpCode);
    Serial.print("Resposta Go: ");
    Serial.println(resGo);

    // Se o Go mandar cortar a energia
    if (resGo.indexOf("\"cortar_rele\":true") > 0)
    {
      Serial.println("COMANDO GO: DESLIGANDO RELÉ!");
      digitalWrite(P_RLY, LOW);
    }
  }
  else
  {
    Serial.print("Erro ao enviar ao Go: ");
    Serial.println(http.errorToString(httpCode).c_str());
  }

  http.end();
}

float calcCrRMS() {
  unsigned long initTime = millis();
  float somaQuad = 0;
  int numAm = 0;

  while(millis() - initTime < 100) {
    int raw = analogRead(P_ACS);
    float tenPin = (raw / 4095.0) * 3.3;
    float tenACS = tenPin * 1.5;
    float dif = tenACS - tenOFF; // Usa o offset dinâmico calibrado
    somaQuad += dif * dif;
    numAm++;
  }
  
  float medQuad = somaQuad / numAm;
  float tenRMS = sqrt(medQuad);
  float crRMS = tenRMS / SENSIBILIDADE;
  
  // Deadband/Threshold para eliminar o ruído residual de fundo do ADC
  if (crRMS < 0.25) {
    crRMS = 0;
  }
  
  return crRMS;
}

void setup()
{
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("Iniciando ESP32");

  uint32_t randomNumber = esp_random();
  espID = "ESP_" + String(randomNumber, HEX);
  espID.toUpperCase();
  Serial.print("ID Gerado para esta ESP32: ");
  Serial.println(espID);
  
  pinMode(P_RLY, OUTPUT);
  digitalWrite(P_RLY, 1);

  analogSetAttenuation(ADC_11db);
  analogReadResolution(12);
  pinMode(P_ACS, INPUT);

  // Calibra o sensor logo no início (certifique-se de ligar sem carga consumindo no relé)
  calibrarACS();

  dht.begin();

  Wire.begin(P_SDA, P_SCL);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C))
  {
    Serial.println(F("Falha ao iniciar o Display OLED"));
    for (;;)
      ;
  }

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(10, 25);
  display.println("Sistema Iniciado");
  display.display();

  connect();
}

void loop()
{
  // Leitura do ACS712
  float cr = calcCrRMS();
  float pt = R_TNS * cr;

  // Leitura do DHT22
  float um = dht.readHumidity();
  float tm = dht.readTemperature();

  if (isnan(um) || isnan(tm))
  {
    um = 0.0;
    tm = 0.0;
  }

  // Proteção relay
  bool proAt = false;
  if (cr > L_COR)
  {
    digitalWrite(P_RLY, 0);
    proAt = true;
  }
  else
  {
    digitalWrite(P_RLY, 1);
  }

  Serial.print("Temp: ");
  Serial.print(tm, 1);
  Serial.print("C | ");
  Serial.print("Umid: ");
  Serial.print(um, 1);
  Serial.print("% | ");
  Serial.print("Corrente: ");
  Serial.print(cr, 2);
  Serial.print("A | ");
  Serial.print("Pot: ");
  Serial.print(pt, 1);
  Serial.print("W | ");
  Serial.println(proAt ? " [ALERTA: SOBRECARGA!]" : "[STATUS: OK]");

  display.clearDisplay();

  display.setTextSize(1);
  display.setCursor(0, 0);
  if (proAt)
  {
    display.println("!! SOBRECARGA AC !!");
  }
  else
  {
    display.println("MONITORAMENTO IOT");
  }
  display.drawLine(0, 10, 127, 10, SSD1306_WHITE);

  display.setCursor(0, 16);
  display.print("Temp: ");
  display.print(tm, 1);
  display.println(" C");

  display.setCursor(0, 28);
  display.print("Umid: ");
  display.print(um, 1);
  display.println(" %");

  display.setCursor(0, 42);
  display.print("Corr: ");
  display.print(cr, 2);
  display.println(" A");

  display.setCursor(0, 54);
  display.print("Pot: ");
  display.print(pt, 1);
  display.println(" W");

  display.display();

  // Dispara a requisição para o Go
  if (millis() - lSolic >= DELAY_ENVIO)
  {
    goSolic(cr, pt, tm, um);
    lSolic = millis();
  }

  delay(100);
}