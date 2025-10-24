
function destacarMáximo(data, baseColor, corDeDestaque) {
  const max = Math.max(...data);
  return data.map(value => (value === max ? corDeDestaque : baseColor));
}


const ctx1 = document.getElementById('graficoDia').getContext('2d');
const dataDia = [4, 8, 6, 7, 9, 12, 5]; 

new Chart(ctx1, {
  type: 'bar',
  data: {
    labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    datasets: [{
      label: 'Alertas',
      data: dataDia,
      backgroundColor: destacarMáximo(dataDia, '#f5b700', '#ff3333'),
      borderRadius: 6
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }
});


const ctx2 = document.getElementById('graficoHora').getContext('2d');
const dataHora = [3, 7, 8, 6, 10, 12, 9, 8, 7, 4, 6, 8];

new Chart(ctx2, {
  type: 'bar',
  data: {
    labels: ['0h', '2h', '4h', '6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'],
    datasets: [{
      label: 'Alertas',
      data: dataHora,
      backgroundColor: destacarMáximo(dataHora, '#f5b700', '#ff3333'),
      borderRadius: 6
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }
});

function criarGrafico(id, dados) {
  new Chart(document.getElementById(id), {
    type: 'bar',
    data: {
      labels: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
      datasets: [{
        data: dados,
        backgroundColor: dados.map(v => v === Math.max(...dados) ? "#ff3333" : "#f4a300"),
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { display: false },
        },
        y: {
          grid: { color: "#eee" },
          ticks: { stepSize: 5 }
        }
      }
    }
  });
}

// Dados fictícios
criarGrafico("graficoCPU", [5, 12, 9, 10, 8, 14, 7]);
criarGrafico("graficoRAM", [6, 13, 10, 9, 8, 15, 6]);
criarGrafico("graficoDisco", [5, 11, 8, 9, 7, 13, 6]);
criarGrafico("graficoRede", [4, 10, 7, 8, 9, 14, 5]);
