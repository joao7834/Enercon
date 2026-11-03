
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
