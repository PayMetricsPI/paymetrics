const ctx_geral = document.getElementById("geral_chart");

preverProxMes("roupas");
preverProxMes("alimentos");
preverProxMes("farmacia");
preverProxMes("moveis");

const coresSegmentos = {
    roupas: "#00009c",
    alimentos: "#c25e00",
    farmacia: "#9c0000",
    moveis: "#70009c"
};

async function buscarDadosGrafico(type, anos, meses) {
    const res = await fetch(`http://localhost:5000/obter/previsao/ano/${type}/${anos}/${meses}`);
    return await res.json();
}

async function obterDatasetDoSegmento(type, anos, meses) {
    const dados = await buscarDadosGrafico(type, anos, meses);

    const hist = [];
    const prev = [];
    const erroUpper = [];
    const erroLower = [];

    for (const med of dados) {
        if (med.previsao) {
            if (prev[prev.length - 1] == null) hist.push(med.vendas);
            prev.push(med.vendas);
            erroUpper.push(parseFloat(med.vendas) + parseFloat(med.mae));
            erroLower.push(parseFloat(med.vendas) - parseFloat(med.mae));
        } else {
            hist.push(med.vendas);
            prev.push(null);
            erroUpper.push(null);
            erroLower.push(null);
        }
    }

    return [
        {
            label: `Histórico ${type}`,
            data: hist,
            borderColor: coresSegmentos[type],
            borderWidth: 3,
            pointRadius: 2,
            tension: 0.4
        },
        {
            label: `Previsão ${type}`,
            data: prev,
            borderColor: coresSegmentos[type],
            borderDash: [6, 4],
            borderWidth: 3,
            pointRadius: 3,
            tension: 0.4
        },
        {
            label: `Upper ${type}`,
            data: erroUpper,
            fill: '+1',
            borderColor: "rgba(0,0,0,0)",
            backgroundColor: coresSegmentos[type] + "33",
            pointRadius: 0,
            tension: 0.4
        },
        {
            label: `Lower ${type}`,
            data: erroLower,
            fill: false,
            borderColor: "rgba(0,0,0,0)",
            backgroundColor: coresSegmentos[type] + "33",
            pointRadius: 0,
            tension: 0.4
        }
    ];
}

function preverProxMes(type) {
    fetch(`http://localhost:5000/obter/previsao/prox/${type}`).then(
        (res) => {
            res.json().then((json) => {
                indice = document.getElementById(`indice_${type}`);
                variacao = document.getElementById(`variacao_${type}`);
                variacao_icon = document.getElementById(`variacao_${type}_icon`);

                indice.innerText = parseFloat(json.previsao).toFixed(2);
                variacao.innerText = parseFloat(json.variacao).toFixed(1).replace("-", "");

                if (parseFloat(json.variacao) <= 0) {
                    variacao_icon.innerText = "arrow_drop_down";
                    variacao_icon.parentElement.classList.add("red");
                } else {
                    variacao_icon.innerText = "arrow_drop_up";
                    variacao_icon.parentElement.classList.add("green");
                }
            });
        }
    );
}

const graph_options = {
    type: 'line',
    data: {
        labels: [],
        datasets: []
    },
    options: {
        plugins: {
            legend: { position: 'top' }
        },
        scales: {
            y: { beginAtZero: false }
        }
    }
};

const geral_chart = new Chart(ctx_geral, graph_options);

const slc_tempo_visualizacao = document.getElementById("slc_tempo_visualizacao");
const slc_tempo_previsao = document.getElementById("slc_tempo_previsao");

slc_tempo_visualizacao.addEventListener("change", (e) => {
    if (slc_tempo_visualizacao.value === "1") {
        slc_tempo_previsao.querySelector('option[value="12"]').disabled = true;
        if (slc_tempo_previsao.value === "12") {
            slc_tempo_previsao.value = "6";
        }
    } else {
        slc_tempo_previsao.querySelector('option[value="12"]').disabled = false;
    }

    atualizarTodosSegmentos();
});

slc_tempo_previsao.addEventListener("change", (e) => {
    atualizarTodosSegmentos();
});

function simular(element) {
    const select_mes = element.parentElement.parentElement.getElementsByClassName("selects")[0].children[0].value;
    const select_ano = element.parentElement.parentElement.getElementsByClassName("selects")[0].children[1].value;
    const type = element.parentElement.parentElement.getElementsByClassName("selects")[0].children[0].getAttribute("type");

    fetch(`http://localhost:5000/obter/previsao/roupas/${select_ano}/${select_mes}`).then(res => {
        res.json().then(data => {
            console.log(data);
        });
    });
}

function obterLimites() {
    fetch("http://localhost:5000/obter/limites/data")
        .then(res => res.json())
        .then(limites => {

            const selectsContainer = document.getElementsByClassName("selects");

            const hoje = new Date();
            const anoAtual = hoje.getFullYear();
            const mesAtual = hoje.getMonth() + 1;

            for (const div of selectsContainer) {

                const selectMes = div.children[0];
                const selectAno = div.children[1];
                const tipo = selectMes.getAttribute("type");

                const limite = limites.find(item => item.type === tipo);
                if (!limite) continue;

                const limiteAno = limite.year;
                const limiteMes = limite.month;

                for (const opt of selectAno.options) {
                    const ano = parseInt(opt.value);
                    opt.disabled = ano > limiteAno;
                }

                function atualizarMeses() {
                    const anoSelecionado = parseInt(selectAno.value);

                    for (const opt of selectMes.options) {
                        const mes = parseInt(opt.value);

                        opt.disabled = false;

                        if (anoSelecionado === anoAtual && mes < mesAtual) {
                            opt.disabled = true;
                        }

                        if (anoSelecionado === limiteAno && mes > limiteMes) {
                            opt.disabled = true;
                        }
                    }

                    if (selectMes.options[selectMes.selectedIndex].disabled) {
                        if (!selectMes.querySelector(`option[value='${mesAtual}']`).disabled) {
                            selectMes.value = mesAtual;
                        }
                        else {
                            selectMes.value = limiteMes;
                        }
                    }
                }

                atualizarMeses();
                selectAno.addEventListener("change", atualizarMeses);
            }
        });
}

async function selectSegmento(element) {
    const anos = slc_tempo_visualizacao.value;
    const meses = slc_tempo_previsao.value;
    const type = element.getAttribute("data-type");

    if (element.classList.contains("seg_select")) {
        element.classList.remove("seg_select");

        geral_chart.data.datasets = geral_chart.data.datasets.filter(ds => !ds.label.includes(type));
        geral_chart.update();
        return;
    }

    element.classList.add("seg_select");

    const datasets = await obterDatasetDoSegmento(type, anos, meses);

    datasets.forEach(ds => geral_chart.data.datasets.push(ds));

    geral_chart.update();
}

async function atualizarTodosSegmentos() {
    const anos = slc_tempo_visualizacao.value;
    const meses = slc_tempo_previsao.value;

    const el_selecionados = document.querySelectorAll(".segmentos > div.seg_select")
    const selecionados = []

    for(sel of el_selecionados){
        selecionados.push(sel.getAttribute("data-type"))
    }

    if (selecionados.length === 0) {
        geral_chart.data.labels = [];
        geral_chart.data.datasets = [];
        geral_chart.update();
        return;
    }

    const dadosBase = await buscarDadosGrafico(selecionados[0], anos, meses);
    const labels = dadosBase.map(med =>
        new Date(med.data).toLocaleDateString("pt-BR", {
            timeZone: "UTC",
            month: "numeric",
            year: "numeric"
        })
    );

    geral_chart.data.labels = labels;
    geral_chart.data.datasets = [];

    for (const type of selecionados) {
        const datasets = await obterDatasetDoSegmento(type, anos, meses);
        datasets.forEach(ds => geral_chart.data.datasets.push(ds));
    }

    geral_chart.update();
}

window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => atualizarTodosSegmentos(), 50);
});

function mostrarProxMes(){
    const local = document.getElementById("prox_mes_show");

    const proxMes = new Date();
    proxMes.setMonth(proxMes.getMonth()+1)

    let proxMesTxt = proxMes.toLocaleString('pt-br', {
        month: 'long'
    })

    proxMesTxt = proxMesTxt.charAt(0).toUpperCase() + proxMesTxt.slice(1)

    local.innerHTML = proxMesTxt;
}