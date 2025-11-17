const ctx = document.getElementById("roupas_chart");

const labels = [
    "2024-01", "2024-02", "2024-03", "2024-04", "2024-05",
    "2024-06", "2024-07", "2024-08", "2024-09", "2024-10"
];

const historico = [10, 12, 13, 15, 18];

const previsoes = [null, null, null, null, 18, 19, 20, 22, 23, 25];

const erro = 5;

const previsaoUpper = [];
const previsaoLower = [];

for (prev of previsoes) {
    if (prev == null) {
        previsaoUpper.push(null);
        previsaoLower.push(null);
    } else {
        previsaoUpper.push(prev + erro);
        previsaoLower.push(prev - erro);
    }
}

new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [
            {
                label: 'Histórico',
                data: historico,
                borderColor: 'blue',
                borderWidth: 3,
                pointRadius: 2,
                pointHoverRadius: 2,
                tension: 0.4
            },
            {
                label: 'Previsão',
                data: previsoes,
                borderColor: "#FFB100",
                borderDash: [6, 4],
                borderWidth: 3,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.4
            },
            {
                label: 'Limite superior',
                data: previsaoUpper,
                fill: '+1',
                borderColor: 'rgba(0,0,0,0)',
                backgroundColor: 'rgba(255,165,0,0.2)',
                pointRadius: 0,
                tension: 0.4
            },
            {
                label: 'Limite inferior',
                data: previsaoLower,
                fill: false,
                borderColor: 'rgba(0,0,0,0)',
                backgroundColor: 'rgba(255,165,0,0.2)',
                pointRadius: 0,
                tension: 0.4
            }
        ]
    },
    options: {
        plugins: {
            legend: { position: 'top' }
        },
        scales: {
            y: { beginAtZero: false }
        }
    }
});