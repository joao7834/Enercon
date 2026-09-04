#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

// Oled
const int SC_WD = 128;                                 // Screen width
const int SC_HG = 64;                                  // Screen height
const int OL_RST = -1;                                 // Oled Reset - Não utilizado
Adafruit_SSD1306 display(SC_WD, SC_HG, &Wire, OL_RST); // Cria um objeto com as informações necessárias do display

// Pinos
const int P_POT = 34;
const int P_DHT = 15;
const int P_RLY = 18;
const int P_SDA = 21;
const int P_SCL = 22;

// DHT
const int DHT_TYPE = DHT22; // Define que o dht usado é o 22
DHT dht(P_DHT, DHT_TYPE);

const float R_TNS = 127.0; // Tensão residencial simulada
const float M_COR = 10.0;  // Corrente máxima
const float L_COR = 7.0;   // Limite de proteção pra desligar o relay

void setup()
{
    Serial.begin(115200);

    // Relay
    pinMode(P_RLY, OUTPUT);
    digitalWrite(P_RLY, 1);

    // ADC Esp32
    analogReadResolution(12); // Faz o esp32 trabalhar com 12 bits -> variação de tensão de 2^12 volts
    pinMode(P_POT, INPUT);

    // DHT22
    dht.begin();

    // Inicialização do display oled I2C
    Wire.begin(P_SDA, P_SCL);
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C))
    {
        Serial.println(F("Falha ao iniciar o Display OLED"));
        for (;;)
            ; // Trava se o OLED falhar
    }
    display.clearDisplay();              // Limpa o display
    display.setTextColor(SSD1306_WHITE); // Deixa ele com a cor padrao do ssd1306
    display.setTextSize(1);
    display.setCursor(10, 25);
    display.println("Sistema Iniciado");
    display.display();
    delay(1500);
}

void loop()
{
    // Leitura do ACS712
    int lt = analogRead(P_POT);       // Leitura
    float cr = (lt / 4095.0) * M_COR; // Corrente
    float pt = R_TNS * cr;            // Potencia

    // Leitura do DHT22
    float um = dht.readHumidity();    // Le umidade
    float tm = dht.readTemperature(); // Le temperatura

    if (isnan(um) || isnan(tm))
    {
        um = 0.0;
        tm = 0.0;
    }

    // Proteção relay
    bool proAt = false; // Proteção ativada
    if (cr > L_COR)
    {
        digitalWrite(P_RLY, 0);
        proAt = true;
    }
    else
    {
        digitalWrite(P_RLY, 1);
    }

    // Exibição de dados no monitor serial
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

    // Atualiza no display
    display.clearDisplay();

    // Status
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
    display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

    // DHT22
    display.setCursor(0, 16);
    display.print("Temp: ");
    display.print(tm, 1);
    display.println(" C");

    display.setCursor(0, 28);
    display.print("Umid: ");
    display.print(um, 1);
    display.println(" %");

    // Consumo elétrico
    display.setCursor(0, 42);
    display.print("Corr: ");
    display.print(cr, 2);
    display.println(" A");
    display.setCursor(0, 54);
    display.print("Pot: ");
    display.print(pt, 1);
    display.println(" W");

    display.display();

    delay(1000);
}
