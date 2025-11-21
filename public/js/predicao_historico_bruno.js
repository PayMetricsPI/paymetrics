const ctx_roupas = document.getElementById("roupas_chart");
const ctx_alimentos = document.getElementById("alimentos_chart");
const ctx_farmacia = document.getElementById("farmacia_chart");
const ctx_movel = document.getElementById("moveis_chart");

preverProxMes("roupas")
preverProxMes("alimentos")
preverProxMes("farmacia")
preverProxMes("moveis")

function preverProxMes(type){
    fetch(`http://localhost:5000/obter/previsao/prox/${type}`).then(
        (res) => {
            res.json().then((json) => {
                indice = document.getElementById(`indice_${type}`)
                variacao = document.getElementById(`variacao_${type}`)
                variacao_icon = document.getElementById(`variacao_${type}_icon`)

                indice.innerText = parseFloat(json.previsao).toFixed(2)
                variacao.innerText = parseFloat(json.variacao).toFixed(1).replace("-", "")

                if(parseFloat(json.variacao) <= 0){
                    variacao_icon.innerText = "arrow_drop_down"
                    variacao_icon.parentElement.classList.add("red")
                }else{
                    variacao_icon.innerText = "arrow_drop_up"
                    variacao_icon.parentElement.classList.add("green")
                }
            })
        }
    )
}

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

const graph_options = {
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
}

new Chart(ctx_roupas, graph_options);
new Chart(ctx_alimentos, graph_options);
new Chart(ctx_farmacia, graph_options);
new Chart(ctx_movel, graph_options);