// =========================================================================
// 1. SERVIDOR JS (Configurado para imprimir os dados do Java no terminal)
// =========================================================================
const http = require('http');

const PORT_JAVA_RECEIVER = 8082; 

const serverParaJava = http.createServer((req, res) => {
  // Cabeçalhos de segurança e CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let corpoDados = '';

    // Captura os fragmentos de dados enviados pelo Java
    req.on('data', chunk => {
      corpoDados += chunk.toString();
    });

    // Evento disparado quando o envio do JSON é concluído
    req.on('end', () => {
      try {
        const jsonRecebidoDoJava = JSON.parse(corpoDados);
        
        // -----------------------------------------------------------------
        // IMPRIME OS DADOS DIRETAMENTE NO TERMINAL ONDE O NODE.JS ESTÁ RODANDO
        // -----------------------------------------------------------------
        console.log("\n==================================================");
        console.log("📥 [NOVO JSON RECEBIDO DO JAVA]");
        console.log("==================================================");
        console.dir(jsonRecebidoDoJava, { depth: null, colors: true }); // Mostra o objeto formatado e colorido
        console.log("==================================================\n");

        // Retorna a resposta de sucesso para o Java
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: "Sucesso", detalhe: "Dados impressos no terminal do JS" }));

      } catch (erro) {
        console.error("❌ Erro ao processar o JSON enviado pelo Java:", erro.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ erro: "O corpo da requisição não é um JSON válido" }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Rota não encontrada');
  }
});

serverParaJava.listen(PORT_JAVA_RECEIVER, () => {
  console.log(`[JS Server] Aguardando requisições do Java na porta ${PORT_JAVA_RECEIVER}...`);
});


// =========================================================================
// 2. SEU CÓDIGO EXISTENTE (Mantido 100% Intacto e Independente)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const formCadastro = document.getElementById("formSec");
  const mensagemEl = document.getElementById("feedbackMsg");

  formCadastro.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nome = document.getElementById("nameInput").value;
    const email = document.getElementById("emailInput").value;
    const type = document.getElementById("levelInput").value;

    const dadosUsuario = { nome, email, type };

    try {
      const resposta = await fetch("http://localhost:8081/javaA", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosUsuario),
      });

      const textoResposta = await resposta.text();

      if (resposta.ok) {
        const mensagemSucesso = "✓ Usuário cadastrado com sucesso! Resposta Java: " + textoResposta;
        mensagemEl.className = "feedbackMsg success";
        window.alert(mensagemSucesso);
        formCadastro.reset();
      } else {
        const mensagemErro = "✕ Erro no processamento. Status: " + resposta.status;
        window.alert(mensagemErro);
      }
    } catch (erro) {
      console.error("Erro de conexão:", erro);
      const mensagemConexao = "Não foi possível conectar ao servidor backend (Java - 8081).";
      window.alert(mensagemConexao);
    }
  });
});
