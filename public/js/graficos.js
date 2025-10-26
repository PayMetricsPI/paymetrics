function destacarMáximo(data, baseColor, corDeDestaque) {
  const max = Math.max(...data);
  return data.map(value => (value === max ? corDeDestaque : baseColor));
}

function criarGrafico(id, labels, dados) {
  const ctx = document.getElementById(id).getContext("2d");
  return new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Alertas",
        data: dados,
        backgroundColor: destacarMáximo(dados, "#f4a300", "#ff3333"),
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: "#eee" } }
      }
    }
  });
}

const dadosPorPeriodo = {
  "1 Mês": {
    resumo: { alertas: 9, minutos: 120, dia: "30/09 (Sex)" },
    dia: [4, 8, 6, 7, 9, 12, 5],
    hora: [3, 7, 8, 6, 10, 12, 9, 8, 7, 4, 6, 8],
    cpu: [8, 15, 12, 11, 10, 20, 9],
    ram: [9, 17, 13, 10, 12, 21, 11],
    disco: [10, 16, 13, 12, 11, 19, 10],
    rede: [7, 13, 10, 9, 8, 17, 8]
  },
  "3 Meses": {
    resumo: { alertas: 27, minutos: 460, dia: "15/08 (Qua)" },
    dia: [7, 9, 14, 11, 10, 13, 8],
    hora: [5, 9, 8, 12, 15, 14, 11, 8, 9, 7, 5, 10],
    cpu: [6, 10, 17, 15, 12, 14, 9],
    ram: [8, 12, 19, 16, 13, 17, 10],
    disco: [9, 13, 18, 14, 12, 15, 9],
    rede: [7, 11, 15, 13, 11, 16, 8]
  },
  "6 Meses": {
    resumo: { alertas: 46, minutos: 890, dia: "22/06 (Dom)" },
    dia: [14, 11, 9, 10, 12, 13, 15],
    hora: [6, 10, 9, 14, 18, 17, 13, 10, 9, 7, 8, 11],
    cpu: [16, 14, 12, 11, 13, 10, 18],
    ram: [17, 15, 13, 12, 14, 11, 19],
    disco: [15, 13, 11, 10, 12, 9, 17],
    rede: [14, 12, 10, 9, 11, 8, 16]
  }
};

let chartDia, chartHora, chartCPU, chartRAM, chartDisco, chartRede;

function atualizarCards(periodo) {
  const { alertas, minutos, dia } = dadosPorPeriodo[periodo].resumo;
  document.getElementById("card-alertas").textContent = alertas;
  document.getElementById("texto-alertas").innerHTML = "alertas<br>no período";
  document.getElementById("card-minutos").textContent = minutos;
  document.getElementById("texto-minutos").innerHTML = "minutos de<br>indisponibilidade";
  document.getElementById("card-dia").textContent = dia;
  document.getElementById("texto-dia").innerHTML = "foi o dia com<br>mais alertas";
}

function atualizarTudo(periodo) {
  const data = dadosPorPeriodo[periodo];
  const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const horas = ["0h","2h","4h","6h","8h","10h","12h","14h","16h","18h","20h","22h"];

  [chartDia, chartHora, chartCPU, chartRAM, chartDisco, chartRede].forEach(c => c && c.destroy());

  chartDia = criarGrafico("graficoDia", dias, data.dia);
  chartHora = criarGrafico("graficoHora", horas, data.hora);

  chartCPU = criarGrafico("graficoCPU", dias, data.cpu);
  chartRAM = criarGrafico("graficoRAM", dias, data.ram);
  chartDisco = criarGrafico("graficoDisco", dias, data.disco);
  chartRede = criarGrafico("graficoRede", dias, data.rede);

  atualizarCards(periodo);
}

document.addEventListener("DOMContentLoaded", () => {
  atualizarTudo("1 Mês");

  const selects = document.querySelectorAll("select");
  selects.forEach(select => {
    select.addEventListener("change", e => atualizarTudo(e.target.value));
  });
});
