const ctx_geral = document.getElementById("geral_chart");
const mesSelect = document.getElementById("mes_sim");
const anoSelect = document.getElementById("ano_sim");
const slc_tempo_visualizacao = document.getElementById("slc_tempo_visualizacao");
const slc_tempo_previsao = document.getElementById("slc_tempo_previsao");

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

preverProxMes("roupas");
preverProxMes("alimentos");
preverProxMes("farmacia");
preverProxMes("moveis");
// bloquearMesesSimulacao();

const coresSegmentos = {
    roupas: "#00009c",
    alimentos: "#c25e00",
    farmacia: "#9c0000",
    moveis: "#70009c"
};

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

window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => atualizarTodosSegmentos(), 50);
});

// anoSelect.addEventListener("change", bloquearMesesSimulacao)





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

function simular() {
    const mes = document.getElementById("mes_sim").value
    const ano = document.getElementById("ano_sim").value
    const type = document.getElementById("segmento_select").value

    const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    let mes_escrita = meses[mes - 1];

    let icontype = ""

    if(type == "roupas") icontype = "checkroom";
    if(type == "alimentos") icontype = "fork_spoon";
    if(type == "farmacia") icontype = "pill";
    if(type == "moveis") icontype = "chair";

    
    fetch(`http://localhost:5000/obter/previsao/${type}/${ano}/${mes}`).then(res => {
        res.json().then(data => {
            const res = document.getElementById("res");
            res.innerHTML = `
                <div class="res_card">
                    <div class="simulacao_res_title">
                        <h2>${mes_escrita} / ${ano}</h2>
                        <span class="material-symbols-outlined icon_sim">
                            ${icontype}
                        </span>
                    </div>
                    <div class="simulacao_result" id="res_container">
                        <p>
                            <span class="indice_vendas">${parseFloat(data.previsao).toFixed(2)}</span> <span>Índice de Vendas Reais</span>
                        </p>
                        <div class="pes_otims">
                            <p class="otimista">
                                <span class="material-symbols-outlined">
                                    thumb_up
                                </span>
                                <span class="indice_vendas_otimista indice_vendas_otim_pess">${(parseFloat(data.previsao) + parseFloat(data.mae)).toFixed(2)}</span> <span>Otimista</span>
                            </p>
                            <p class="pessimista">
                                <span class="material-symbols-outlined">
                                    thumb_down
                                </span>
                                <span class="indice_vendas_pessimista indice_vendas_otim_pess">${(parseFloat(data.previsao) - parseFloat(data.mae)).toFixed(2)}</span> <span>Pessimista</span>
                            </p>
                        </div>
                        <p>
                            <span class="mae_sim">${parseFloat(data.mae).toFixed(2)}</span> <span>Erro médio absoluto</span>
                        </p>
                    </div>
                </div>
            `+res.innerHTML;
        });
    });
}

function obterLimites() {
    fetch("http://localhost:5000/obter/limites/data")
        .then(res => res.json())
        .then(limites => {

            const row = document.querySelector(".selects .row");
            const selectMes = row.querySelector("#mes_sim");
            const selectAno = row.querySelector("#ano_sim");
            const selectSegmento = document.querySelector("#segmento_select");

            const hoje = new Date();
            const anoAtual = hoje.getFullYear();
            const mesAtual = hoje.getMonth() + 1;

            function aplicarLimites() {

                const tipo = selectSegmento.value;

                const limite = limites.find(item => item.type === tipo);
                if (!limite) return;

                const limiteAno = limite.year;
                const limiteMes = limite.month;

                for (const opt of selectAno.options) {
                    const ano = parseInt(opt.value);
                    opt.disabled = ano > limiteAno;
                }

                if (parseInt(selectAno.value) > limiteAno) {
                    selectAno.value = limiteAno;
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

                        const mesAtualOption = selectMes.querySelector(`option[value='${mesAtual}']`);

                        if (mesAtualOption && !mesAtualOption.disabled) {
                            selectMes.value = mesAtual;
                        } else {
                            selectMes.value = limiteMes;
                        }
                    }
                }

                atualizarMeses();
                selectAno.onchange = atualizarMeses;
            }
            aplicarLimites();
            selectSegmento.addEventListener("change", aplicarLimites);
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

    for (sel of el_selecionados) {
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



function mostrarProxMes() {
    const local = document.getElementById("prox_mes_show");

    const proxMes = new Date();
    proxMes.setMonth(proxMes.getMonth() + 1)

    let proxMesTxt = proxMes.toLocaleString('pt-br', {
        month: 'long'
    })

    proxMesTxt = proxMesTxt.charAt(0).toUpperCase() + proxMesTxt.slice(1)

    local.innerHTML = proxMesTxt;
}

function obterMetricasRandomForest() {
    fetch("http://localhost:5000/obter/metricas").then(res => res.json())
        .then(json => {
            const containers = document.querySelectorAll(".values_modal_metricas")
            for (let i = 0; i < json.length; i++) {
                containers[i].children[0].innerHTML = `<strong>R²</strong>: ${parseFloat(json[i].r2).toFixed(2)}`
                containers[i].children[1].innerHTML = `<strong>MAE</strong>: ${parseFloat(json[i].mae).toFixed(2)}`
            }
        })
}

function modalToggle() {
    const modal = document.querySelector('.out_modal_metricas');
    modal.classList.toggle("showed_out")
}


// function bloquearMesesSimulacao() {
//     var hoje = new Date()
//     var anoAtual = hoje.getFullYear()
//     var mesAtual = hoje.getMonth() + 1
//     var anoEscolhido = parseInt(anoSelect.value)

//     for (var i = 0; i < mesSelect.options.length; i++) {
//         var opt = mesSelect.options[i]
//         var mes = parseInt(opt.value)

//         if (anoEscolhido < anoAtual) {
//             opt.disabled = true
//         } else if (anoEscolhido === anoAtual) {
//             opt.disabled = mes < mesAtual
//         } else {
//             opt.disabled = false
//         }
//     }
// }
