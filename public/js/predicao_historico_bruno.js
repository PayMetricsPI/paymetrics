const ctx_roupas = document.getElementById("roupas_chart");
const ctx_alimentos = document.getElementById("alimentos_chart");
const ctx_farmacia = document.getElementById("farmacia_chart");
const ctx_movel = document.getElementById("moveis_chart");

preverProxMes("roupas")
preverProxMes("alimentos")
preverProxMes("farmacia")
preverProxMes("moveis")

async function buscarDadosGrafico(type, anos, meses){
    const res = await fetch(`http://localhost:5000/obter/previsao/ano/${type}/${anos}/${meses}`)
    return await res.json()
}

async function atualizarGrafico(grafico, type, anos, meses){
    const label = []
    const hist = []
    const prev = []
    const erroUpper = []
    const erroLower = []
    
    const dados = await buscarDadosGrafico(type, anos, meses)

    for(med of dados){
        label.push(new Date(med.data).toLocaleDateString("pt-BR", {
            timeZone: "UTC",
            month: "numeric",
            year: "numeric"
        }))
        if(med.previsao){
            if(prev[prev.length-1] == null) hist.push(med.vendas)
            prev.push(med.vendas)
            erroUpper.push(parseFloat(med.vendas)+parseFloat(med.mae))
            erroLower.push(parseFloat(med.vendas)-parseFloat(med.mae))
        }else{
            hist.push(med.vendas)
            prev.push(null)
            erroUpper.push(null)
            erroLower.push(null)
        }
    }

    console.log(dados)

    grafico.data.labels = label;
    grafico.data.datasets[0].data = hist;
    grafico.data.datasets[1].data = prev;
    grafico.data.datasets[2].data = erroUpper;
    grafico.data.datasets[3].data = erroLower;
    
    grafico.update();
}

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

const graph_options = {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Histórico',
                data: [],
                borderColor: 'blue',
                borderWidth: 3,
                pointRadius: 2,
                pointHoverRadius: 2,
                tension: 0.4
            },
            {
                label: 'Previsão',
                data: [],
                borderColor: "#FFB100",
                borderDash: [6, 4],
                borderWidth: 3,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.4
            },
            {
                label: 'Limite superior',
                data: [],
                fill: '+1',
                borderColor: 'rgba(0,0,0,0)',
                backgroundColor: 'rgba(255,165,0,0.2)',
                pointRadius: 0,
                tension: 0.4
            },
            {
                label: 'Limite inferior',
                data: [],
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

const roupas_chart = new Chart(ctx_roupas, graph_options);
const alimentos_chart = new Chart(ctx_alimentos, graph_options);
const farmacia_chart = new Chart(ctx_farmacia, graph_options);
const moveis_chart = new Chart(ctx_movel, graph_options);

atualizarGrafico(roupas_chart, "roupas", 1, 4)
atualizarGrafico(alimentos_chart, "alimentos", 1, 4)
atualizarGrafico(farmacia_chart, "farmacia", 1, 4)
atualizarGrafico(moveis_chart, "moveis", 1, 4)

const slc_roupas = document.getElementById("slc_roupas");
const slc_alimentos = document.getElementById("slc_alimentos");
const slc_farmacia = document.getElementById("slc_farmacia");
const slc_moveis = document.getElementById("slc_moveis");

const slc_roupas_meses = document.getElementById("slc_roupas_meses");
const slc_alimentos_meses = document.getElementById("slc_alimentos_meses");
const slc_farmacia_meses = document.getElementById("slc_farmacia_meses");
const slc_moveis_meses = document.getElementById("slc_moveis_meses");

slc_roupas.addEventListener("change", (e) => {
    if (slc_roupas.value === "1") {
        slc_roupas_meses.querySelector('option[value="12"]').disabled = true;
        if (slc_roupas_meses.value === "12") {
            slc_roupas_meses.value = "6";
        }
    } else {
        slc_roupas_meses.querySelector('option[value="12"]').disabled = false;
    }
    atualizarGrafico(roupas_chart, "roupas", slc_roupas.value, slc_roupas_meses.value)
})

slc_alimentos.addEventListener("change", (e) => {
    if (slc_alimentos.value === "1") {
        slc_alimentos_meses.querySelector('option[value="12"]').disabled = true;
        if (slc_alimentos_meses.value === "12") {
            slc_alimentos_meses.value = "6";
        }
    } else {
        slc_alimentos_meses.querySelector('option[value="12"]').disabled = false;
    }
    atualizarGrafico(alimentos_chart, "alimentos", slc_alimentos.value, slc_alimentos_meses.value)
})

slc_farmacia.addEventListener("change", (e) => {
    if (slc_farmacia.value === "1") {
        slc_farmacia_meses.querySelector('option[value="12"]').disabled = true;
        if (slc_farmacia_meses.value === "12") {
            slc_farmacia_meses.value = "6";
        }
    } else {
        slc_farmacia_meses.querySelector('option[value="12"]').disabled = false;
    }
    atualizarGrafico(farmacia_chart, "farmacia", slc_farmacia.value, slc_farmacia_meses.value)
})

slc_moveis.addEventListener("change", (e) => {
    if (slc_moveis.value === "1") {
        slc_moveis_meses.querySelector('option[value="12"]').disabled = true;
        if (slc_moveis_meses.value === "12") {
            slc_moveis_meses.value = "6";
        }
    } else {
        slc_moveis_meses.querySelector('option[value="12"]').disabled = false;
    }
    atualizarGrafico(moveis_chart, "moveis", slc_moveis.value, slc_moveis_meses.value)
})


slc_roupas_meses.addEventListener("change", (e) => {
    atualizarGrafico(roupas_chart, "roupas", slc_roupas.value, slc_roupas_meses.value)
})

slc_alimentos_meses.addEventListener("change", (e) => {
    atualizarGrafico(alimentos_chart, "alimentos", slc_alimentos.value, slc_alimentos_meses.value)
})

slc_farmacia_meses.addEventListener("change", (e) => {
    atualizarGrafico(farmacia_chart, "farmacia", slc_farmacia.value, slc_farmacia_meses.value)
})

slc_moveis_meses.addEventListener("change", (e) => {
    atualizarGrafico(moveis_chart, "moveis", slc_moveis.value, slc_moveis_meses.value)
})


function simular(element){
    const select_mes = element.parentElement.parentElement.getElementsByClassName("selects")[0].children[0].value;
    const select_ano = element.parentElement.parentElement.getElementsByClassName("selects")[0].children[1].value;
    const type = element.parentElement.parentElement.getElementsByClassName("selects")[0].children[0].getAttribute("type");
    
    fetch(`http://localhost:5000/obter/previsao/roupas/${select_ano}/${select_mes}`).then(res => {
        res.json().then(data => {
            console.log(data)
        })
    })
}