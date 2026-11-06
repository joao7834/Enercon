const http = require("http");

const PORT = 8082;

// Histórico em memória
const historicoTelemetria = [];
const MAX_HISTORICO = 50;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. ROTA GET: O Dashboard busca a leitura atual
  if (req.method === "GET" && req.url === "/telemetria-atual") {
    const ultima =
      historicoTelemetria.length > 0
        ? historicoTelemetria[0]
        : {
            corrente: 0,
            potencia: 0,
            temperatura: 0,
            umidade: 0,
            espID: "OFFLINE",
          };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(ultima));
    return;
  }

  // 2. ROTA GET: O Dashboard busca o histórico completo e a tabela
  if (req.method === "GET" && req.url === "/telemetria-historico") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(historicoTelemetria));
    return;
  }

  // 3. ROTA POST: O Java (Cheddar.java) envia os dados para cá
  if (req.method === "POST") {
    let corpoDados = "";

    req.on("data", (chunk) => {
      corpoDados += chunk.toString();
    });

    req.on("end", () => {
      try {
        let corpoCorrigido = corpoDados.replace(/(\d+),(\d+)/g, "$1.$2");
        const dadosRecebidos = JSON.parse(corpoCorrigido);

        // Adiciona timestamp formatado
        dadosRecebidos.timestamp = new Date().toLocaleTimeString("pt-BR");

        // Salva no topo do histórico
        historicoTelemetria.unshift(dadosRecebidos);
        if (historicoTelemetria.length > MAX_HISTORICO) {
          historicoTelemetria.pop();
        }

        console.log(
          `📥 [DASHBOARD ATUALIZADO] ID: ${dadosRecebidos.espID} | Corr: ${dadosRecebidos.corrente}A | Pot: ${dadosRecebidos.potencia}W`,
        );

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "Sucesso" }));
      } catch (erro) {
        console.error("❌ Erro ao parsear JSON no server.js:", erro.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ erro: "JSON inválido" }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Rota não encontrada");
});

server.listen(PORT, () => {
  console.log(
    `[JS Server] Rodando e pronto para o Dashboard na porta ${PORT}...`,
  );
});
