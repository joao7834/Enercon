document.addEventListener("DOMContentLoaded", () => {
  const valTensao = document.getElementById("valTensao");
  const valCorrente = document.getElementById("valCorrente");
  const valPotencia = document.getElementById("valPotencia");
  const valConsumo = document.getElementById("valConsumo");
  const valTemperatura = document.getElementById("valTemperatura");
  const valUmidade = document.getElementById("valUmidade");
  const valRele = document.getElementById("valRele");

  const espIDLabel = document.getElementById("espID");
  const statusDot = document.getElementById("statusDot");
  const telemetryBody = document.getElementById("telemetryBody");

  let consumoAcumuladoKWh = 0;
  let ultimaAtualizacao = Date.now();

  const ctx = document.getElementById("powerChart")?.getContext("2d");
  let powerChart = null;

  if (ctx) {
    powerChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Histórico de Potência (W)",
            data: [],
            borderColor: "#38bdf8",
            backgroundColor: "rgba(56, 189, 248, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94a3b8" },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94a3b8" },
          },
        },
        plugins: { legend: { labels: { color: "#f8fafc" } } },
      },
    });
  }

  async function atualizarDashboard() {
    try {
      // 1. Busca os dados mais recentes para os Cards do Topo
      const resAtual = await fetch("http://localhost:8082/telemetria-atual");
      if (resAtual.ok) {
        const dados = await resAtual.json();

        if (espIDLabel) espIDLabel.textContent = dados.espID || "ESP32_OFF";
        if (statusDot) statusDot.className = "statsDot online";

        if (valTensao) valTensao.innerHTML = `127.0 <small>V</small>`;
        if (valCorrente)
          valCorrente.innerHTML = `${parseFloat(dados.corrente || 0).toFixed(2)} <small>A</small>`;
        if (valPotencia)
          valPotencia.innerHTML = `${parseFloat(dados.potencia || 0).toFixed(1)} <small>W</small>`;
        if (valTemperatura)
          valTemperatura.innerHTML = `${parseFloat(dados.temperatura || 0).toFixed(1)} <small>°C</small>`;
        if (valUmidade)
          valUmidade.innerHTML = `${parseFloat(dados.umidade || 0).toFixed(1)} <small>%</small>`;

        // Cálculo de consumo
        const agoraMs = Date.now();
        const intervaloHoras = (agoraMs - ultimaAtualizacao) / (1000 * 60 * 60);
        ultimaAtualizacao = agoraMs;
        consumoAcumuladoKWh +=
          (parseFloat(dados.potencia || 0) / 1000) * intervaloHoras;
        if (valConsumo)
          valConsumo.innerHTML = `${consumoAcumuladoKWh.toFixed(4)} <small>kWh</small>`;

        // Estado do relé
        const correnteAtual = parseFloat(dados.corrente || 0);
        if (correnteAtual > 7.0) {
          if (valRele) {
            valRele.textContent = "DESARMADO";
            valRele.style.color = "var(--red)";
          }
        } else {
          if (valRele) {
            valRele.textContent = "OPERACIONAL";
            valRele.style.color = "var(--green)";
          }
        }
      }

      // 2. Busca o histórico completo armazenado no servidor para preencher a tabela e o gráfico com os dados antigos
      const resHist = await fetch("http://localhost:8082/telemetria-historico");
      if (resHist.ok) {
        const historico = await resHist.json();

        if (historico.length > 0 && telemetryBody) {
          telemetryBody.innerHTML = historico
            .map((item) => {
              const corrente = parseFloat(item.corrente || 0);
              let badge = '<span class="badge success">Estável</span>';
              if (corrente > 7.0)
                badge = '<span class="badge danger">SOBRECARGA</span>';
              else if (corrente > 5.0)
                badge = '<span class="badge warning">Atenção</span>';

              return `
              <tr>
                <td>${item.timestamp || "--:--:--"}</td>
                <td>${item.espID || "ESP32"}</td>
                <td>${corrente.toFixed(2)} A</td>
                <td>${parseFloat(item.potencia || 0).toFixed(1)} W</td>
                <td>${parseFloat(item.temperatura || 0).toFixed(1)} °C</td>
                <td>${parseFloat(item.umidade || 0).toFixed(1)} %</td>
                <td>${badge}</td>
              </tr>
            `;
            })
            .join("");

          // Atualiza o gráfico com as leituras ordenadas cronologicamente
          if (powerChart) {
            const dadosRevertidos = [...historico].reverse(); // Do mais antigo para o mais recente
            powerChart.data.labels = dadosRevertidos.map(
              (i) => i.timestamp || "",
            );
            powerChart.data.datasets[0].data = dadosRevertidos.map((i) =>
              parseFloat(i.potencia || 0),
            );
            powerChart.update("none");
          }
        }
      }
    } catch (erro) {
      console.error("Erro ao sincronizar telemetria:", erro);
      if (statusDot) statusDot.className = "statsDot offline";
      if (espIDLabel) espIDLabel.textContent = "Offline";
    }
  }

  atualizarDashboard();
  setInterval(atualizarDashboard, 2000);
});
