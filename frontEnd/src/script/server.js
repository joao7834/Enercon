const http = require("http");

const PORT_JAVA_RECEIVER = 8082;

// Lista para armazenar o histórico de telemetria em memória (máximo de 50 registros)
const historicoTelemetria = [];
const MAX_HISTORICO_MEMORIA = 50;

const serverParaJava = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // ROTA GET: Retorna a última leitura (para o tempo real)
  if (req.method === "GET" && req.url === "/telemetria-atual") {
    const ultima =
      historicoTelemetria.length > 0
        ? historicoTelemetria[0]
        : {
            corrente: 0,
            potencia: 0,
            temperatura: 0,
            umidade: 55,
            espID: "OFFLINE",
          };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(ultima));
    return;
  }

  // ROTA GET: Retorna o histórico completo para permitir visualizar leituras antigas
  if (req.method === "GET" && req.url === "/telemetria-historico") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(historicoTelemetria));
    return;
  }

  // ROTA POST: Recebe os dados da ESP32/Java
  if (req.method === "POST") {
    let corpoDados = "";

    req.on("data", (chunk) => {
      corpoDados += chunk.toString();
    });

    req.on("end", () => {
      try {
        let corpoCorrigido = corpoDados.replace(/(\d+),(\d+)/g, "$1.$2");
        corpoCorrigido = corpoCorrigido.replace(
          /([{,]\s*)([a-zA-Z0-9_]+)\s*:/g,
          '$1"$2":',
        );

        const jsonRecebidoDoJava = JSON.parse(corpoCorrigido);

        // Adiciona a data/hora exata do registro no servidor
        jsonRecebidoDoJava.timestamp = new Date().toLocaleTimeString("pt-BR");

        // Insere no início do array de histórico
        historicoTelemetria.unshift(jsonRecebidoDoJava);

        // Limita o tamanho máximo para não estourar a memória
        if (historicoTelemetria.length > MAX_HISTORICO_MEMORIA) {
          historicoTelemetria.pop();
        }

        const { corrente, potencia, temperatura, umidade, espID } =
          jsonRecebidoDoJava;

        console.log(
          `📥 [HISTÓRICO] Dado salvo - ID: ${espID} | Corrente: ${corrente}A | Potência: ${potencia}W`,
        );

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            status: "Sucesso",
            detalhe: "Salvo no histórico com sucesso",
          }),
        );
      } catch (erro) {
        console.error("❌ Erro ao processar o JSON:", erro.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ erro: "JSON inválido" }));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Rota não encontrada");
  }
});

serverParaJava.listen(PORT_JAVA_RECEIVER, () => {
  console.log(
    `[JS Server] Rodando com suporte a histórico na porta ${PORT_JAVA_RECEIVER}...`,
  );
});
