let pingRealtimeCache = null;




async function carregarUltimoJson() {
    try {
        const resp = await fetch("/s3/ultimodia");
        if (!resp.ok) {
            console.error("Erro ao buscar último JSON");
            return null;
        }
        return await resp.json();
    } catch (err) {
        console.error("Erro carregarUltimoJson:", err);
        return null;
    }
}

function calcularLatenciaGlobal(dados) {
    if (!Array.isArray(dados)) return 0;

    let soma = 0;
    let count = 0;

    for (let item of dados) {
        const v = Number(item.latencia_ms);
        if (!isNaN(v)) {
            soma += v;
            count++;
        }
    }

    return count > 0 ? Math.round(soma / count) : 0;
}

async function fetchS3(file) {
    try {
        const resp = await fetch(`/s3/${file}`);
        if (!resp.ok) {
            console.log(`404 no proxy: /s3/${file}`);
            return null;
        }
        return await resp.json();
    } catch (err) {
        console.error("Erro no fetchS3:", err);
        return null;
    }
}

async function buscarJsonDoDia(dataStr) {
    return await fetchS3(`output/${dataStr}-latencia.json`) ||
           await fetchS3(`${dataStr}-latencia.json`);
}

async function carregarPingRealtime(force = false) {
    if (!force && pingRealtimeCache) return pingRealtimeCache;

    let dados = await carregarUltimoJson();

    if (dados && Array.isArray(dados)) {
        const processed = {};

        dados.forEach(item => {
            const pais = item.pais;
            const estado = item.estado || "XX";
            const chaveEstado = estado;

            const mb = Number(item.MB_enviados) || 0;
            const lat = Number(item.latencia_ms) || 0;
            const tps = lat > 0 ? Math.round(1000 / lat) : 0;

            if (!processed[pais]) {
                processed[pais] = {
                    media: 0,
                    total_lat: 0,
                    count_lat: 0,
                    estados: {},
                    tps_total: 0,
                    tps_qtd: 0
                };
            }

            processed[pais].estados[chaveEstado] = lat;
            processed[pais].total_lat += lat;
            processed[pais].count_lat++;

            processed[pais].tps_total += tps;
            processed[pais].tps_qtd++;
        });

        Object.keys(processed).forEach(p => {
            const c = processed[p].count_lat;
            processed[p].media = c > 0 ? Math.round(processed[p].total_lat / c) : 0;
            processed[p].tps_media =
                processed[p].tps_qtd > 0
                    ? Math.round(processed[p].tps_total / processed[p].tps_qtd)
                    : 0;
        });

        pingRealtimeCache = processed;
        return processed;
    }

    pingRealtimeCache = {};
    return {};
}

function atualizarTPSTotal(valor) {
    const card = document.querySelector(".mini-card:nth-child(2)");
    const valorElemento = card?.querySelector(".mini-value");
    const tituloElemento = card?.querySelector(".mini-title");

    if (!valorElemento || !tituloElemento) return;

    valorElemento.textContent = `${valor} TPS`;

    const status = classificarTPS(valor);

    tituloElemento.textContent = `TPS Total —  ${status.texto}`;

    card.classList.remove("ok", "warning", "critical");
    card.classList.add(status.classe.split(" ")[1]);
}

async function gerarPingEstado(pais, estado) {
    const dados = await carregarPingRealtime();
    if (!dados[pais]) return null;

    const estados = dados[pais].estados || {};

    if (estado in estados) return estados[estado];
    return dados[pais].media;
}

function datasUltimos7Dias() {
    const hoje = new Date();
    const datas = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(hoje.getDate() - i);

        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const dia = String(d.getDate()).padStart(2, '0');

        datas.push(`${ano}-${mes}-${dia}`);
    }

    return datas;
}

function calcularMediaDia(lista) {
    if (!lista || lista.length === 0) return null;

    const nums = lista
        .map(x => Number(x.latencia_ms))
        .filter(v => !isNaN(v));

    if (nums.length === 0) return null;

    const media = nums.reduce((a, b) => a + b, 0) / nums.length;

    return Math.round(media);
}

async function buscarHistorico7Dias() {
    const datas = datasUltimos7Dias();
    const historico = [];

    for (const d of datas) {
        const jsonDia = await buscarJsonDoDia(d);
        const media = calcularMediaDia(jsonDia);

        if (media !== null) {
            historico.push({
                data: d,
                media: media
            });
        }
    }

    return historico.reverse();
}

async function buscarHistoricoPais7Dias(pais) {
    const datas = datasUltimos7Dias();
    const historico = [];

    for (const d of datas) {
        const jsonDia = await buscarJsonDoDia(d);
        if (!jsonDia) continue;

        const registrosPais = jsonDia.filter(x => x.pais === pais);
        if (registrosPais.length === 0) continue;

        const media = calcularMediaDia(registrosPais);
        if (media === null) continue;

        historico.push({ data: d, media });
    }

    return historico.reverse();
}


async function preencherSelectPaises() {
    const select = document.getElementById("selectPais");
    if (!select) return;

    select.innerHTML = "";

    const optGlobal = document.createElement("option");
    optGlobal.value = "GLOBAL";
    optGlobal.textContent = "Todos os países";
    select.appendChild(optGlobal);

    const paises = ["BR", "US", "CA", "FR", "JP"];
    
    paises.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p;
        opt.textContent = p;
        select.appendChild(opt);
    });

    const salvo = sessionStorage.getItem("paisSelecionado");
    if (salvo === "GLOBAL" || (salvo && paises.includes(salvo))) {
        select.value = salvo;
    }

    select.addEventListener("change", async (ev) => {
        const valor = ev.target.value;
        sessionStorage.setItem("paisSelecionado", valor);

        if (valor === "GLOBAL") {
            await iniciarMapa();
            if (btnVoltar) btnVoltar.classList.remove("show");
            const historicoGlobal = await buscarHistorico7Dias();
            atualizarGraficoLatenciaComDados(historicoGlobal);
            return;
        }

       
        await iniciarMapa();
        if (btnVoltar) btnVoltar.classList.remove("show");

        await atualizarCardEventos(valor);

        const estados = await obterMapaEstados(valor);
        if (estados.length > 0) {
            exibirEstados(valor, estados);
        } else {
            const lat = await gerarPingPais(valor);
            atualizarTabela([{ nome: valor, latencia: lat }]);
        }

        atualizarGraficoLatencia();
    });
}

function classificarTPS(valor) {
    if (valor > 800) return { texto: "Crítico", classe: "status critical" };
    if (valor > 400) return { texto: "Atenção", classe: "status warning" };
    return { texto: "Normal", classe: "status ok" };
}

function getEmpresa() {
    return sessionStorage.getItem("id");
}

async function obterMapaGlobal() {
    const fk = getEmpresa();
    if (!fk) return [];

    const url = `/servidores/mapa/${fk}`;

    try {
        const resp = await fetch(url);
        const texto = await resp.text();

        try {
            const dados = JSON.parse(texto);
            return dados.map(item => ({
                id: item.pais,
                size: item.quantidade
            }));
        } catch {
            return [];
        }

    } catch (e) {
        console.error(e);
        return [];
    }
}

async function obterMapaEstados(pais) {
    const fk = getEmpresa();
    const url = `/servidores/mapa/${fk}/${pais}`;

    try {
        const resp = await fetch(url);
        const texto = await resp.text();

        try {
            const dados = JSON.parse(texto);
            return dados.map(item => ({
                id: `${pais}.${item.estado}`,
                value: item.quantidade
            }));
        } catch {
            return [];
        }
    } catch (e) {
        console.error(e);
        return [];
    }
}

async function obterEventosAPI(pais = "BR") {
    const ano = new Date().getFullYear();
    const url = `https://date.nager.at/api/v3/PublicHolidays/${ano}/${pais}`;
    try {
        const r = await fetch(url);
        return await r.json();
    } catch (e) {
        console.error("erro ao buscar eventos:", e);
        return [];
    }
}

async function obterEventoDoMes(pais = "BR") {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const eventos = await obterEventosAPI(pais);
    const eventosMes = eventos.filter(e => {
        const data = new Date(e.date);
        return data.getMonth() === mesAtual && data >= hoje;
    });
    return eventosMes[0] || null;
}

function diasRestantesEvento(dataStr) {
    const hoje = new Date();
    const dataEvento = new Date(dataStr);
    return Math.ceil((dataEvento - hoje) / 86400000);
}

function atualizarLatenciaMediaGlobal(valor) {
    const elemento = document.querySelector(".mini-card:nth-child(3) .mini-value");
    if (elemento) elemento.textContent = `${valor}ms`;
}

function atualizarTabela(lista) {
    const tableBody = document.querySelector(".latency-table tbody");

    if (!tableBody || !lista || lista.length === 0) {
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="4">Nenhum servidor encontrado</td></tr>`;
        return;
    }

    tableBody.innerHTML = "";

    lista.forEach(item => {
        let statusClass = 'status ok';
        let statusText = 'Normal';
        let impactoText = 'Baixo impacto';

        if (item.latencia > 120) {
            statusClass = 'status critical';
            statusText = 'Crítico';
            impactoText = 'Alto risco de Drop-off';
        } else if (item.latencia > 90) {
            statusClass = 'status warning';
            statusText = 'Atenção';
            impactoText = 'Médio risco de Drop-off';
        }

        tableBody.innerHTML += `
            <tr>
                <td>${item.nome}</td>
                <td>${item.latencia}ms</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>${impactoText}</td>
            </tr>
        `;
    });
}

let mapa;
let btnVoltar;

function atualizarCard(qtd, texto) {
    const cardValor = document.querySelector(".mini-card:nth-child(1) .mini-value");
    const cardStatus = document.querySelector(".mini-card:nth-child(1) .mini-title");

    if (cardValor) cardValor.textContent = qtd;
    if (cardStatus) cardStatus.textContent = texto;
}

function atualizarCardEventos(pais = "BR") {
    console.log("atualizarCardEventos chamado:", pais);
}

document.addEventListener("DOMContentLoaded", () => {
    btnVoltar = document.querySelector(".btn-voltar");
    iniciarMapa();
    atualizarCardEventos();
    preencherSelectPaises();
    atualizarGraficoLatencia();
});

const mapasPais = {
    BR: anychart.maps.brazil,
    US: anychart.maps.united_states_of_america,
    CA: anychart.maps.canada,
    FR: anychart.maps.france,
    JP: anychart.maps.japan
};

async function gerarPingPais(pais) {
    const dados = await carregarPingRealtime();
    if (!dados[pais]) return 0;

    let valor = Math.round(dados[pais].media) || 0;
    if (valor > 600) valor = 600;
    return valor;
}

async function iniciarMapa() {
    const dataGlobal = await obterMapaGlobal();
    await carregarPingRealtime();

    for (const item of dataGlobal) {
        const latMedia = await gerarPingPais(item.id);
        item.value = latMedia;
    }

    const media = Math.round(
        dataGlobal.reduce((acc, e) => acc + (e.value || 0), 0) / (dataGlobal.length || 1)
    );

    atualizarLatenciaMediaGlobal(media);

    const tpsGlobal = Object.values(pingRealtimeCache || {})
        .reduce((a, e) => a + (e.tps_media || 0), 0);

    atualizarTPSTotal(tpsGlobal);

    mapa = anychart.map();
    mapa.container("miniMapa");
    mapa.geoData(anychart.maps.world);

    mapa.title()
  .enabled(true)
  .text("Distribuição Global de Latência")
  .fontSize(18)
  .fontWeight("600")
  .fontColor("#000")
  .padding(0, 0, 15, 0)
  .align("center");


    mapa.background().fill("#fff");

    mapa.unboundRegions()
        .enabled(true)
        .fill("#0c065dff")
        .stroke("#3c424a");

    if (dataGlobal.length === 0) {
        atualizarTabela([]);
        atualizarCard(0, "Nenhum servidor");
        mapa.draw();
        return;
    }

    let scale = anychart.scales.linearColor();
    scale.minimum(40);
    scale.maximum(250);
    scale.colors(["#4CAF50", "#FFC107", "#D32F2F"]);

    for (const e of dataGlobal) {
        e.fill =
            e.value < 90 ? "#4CAF50" :
            e.value < 120 ? "#FFC107" :
                            "#D32F2F";
    }

    let series = mapa.bubble(dataGlobal);
    series.geoIdField("id");
    series.size("size");
    series.color("value");

    series.color(function () {
        const v = this.get ? this.get("value") : this.value || this.latency || 0;
        if (v < 90) return "#4CAF50";
        if (v < 120) return "#FFC107";
        return "#D32F2F";
    });

    series.hovered().fill(function () {
        const v = this.get ? this.get("value") : this.value || this.latency || 0;
        if (v < 90) return "#66BB6A";
        if (v < 120) return "#FFCA28";
        return "#E57373";
    });

    series.selected().fill(function () {
        const v = this.get ? this.get("value") : this.value || this.latency || 0;
        if (v < 90) return "#2E7D32";
        if (v < 120) return "#FFB300";
        return "#C62828";
    });

    series.normal().stroke("2 #fff");
    series.labels(true);
    series.labels().format("{%value}ms");
    series.labels().fontColor("#000");
    series.labels().fontWeight("bold");

    mapa.padding(10, 10, 10, 10);
    mapa.zoom(0.85);
    mapa.draw();
    mapa.fitAll();

    series.listen("pointClick", async e => {
        const pais = e.point.get("id");
        atualizarCard(1, pais);
        await atualizarCardEventos(pais);

        sessionStorage.setItem("paisSelecionado", pais);
        atualizarGraficoLatencia();

        const estados = await obterMapaEstados(pais);

        if (estados.length > 0) {
            exibirEstados(pais, estados);
        } else {
            const lat = await gerarPingPais(pais);
            atualizarTabela([{ nome: pais, latencia: lat }]);
        }
    });

    atualizarTabela(
        dataGlobal.map(e => ({
            nome: e.id,
            latencia: e.value
        }))
    );

    const qtdServidores = dataGlobal
        .map(e => e.size || 0)
        .reduce((a, b) => a + b, 0);

    atualizarCard(qtdServidores, "Servidores Globais");
}

async function exibirEstados(pais, dadosEstados) {
    const mapaPais = mapasPais[pais];

    if (!mapaPais) return;

    mapa.geoData(mapaPais);
    mapa.removeAllSeries();

    let serieEstados = mapa.choropleth(dadosEstados);
    serieEstados.geoIdField("id");

    const listaTabela = [];

    for (const e of dadosEstados) {
        const estado = e.id.split(".")[1];
        const lat = await gerarPingEstado(pais, estado);

        listaTabela.push({
            nome: e.id,
            latencia: lat
        });
    }

    atualizarTabela(listaTabela);

    if (btnVoltar) btnVoltar.classList.add("show");
    mapa.fitAll();
}

async function voltarGlobal() {
    await iniciarMapa();
    if (btnVoltar) btnVoltar.classList.remove("show");
    await atualizarCardEventos("BR");
}

const ctx = document.getElementById("bfChart");

const hoje = new Date();
let mesAtualIndex = hoje.getMonth();

const mesLista = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez"
];

let chartBF = null;

async function atualizarGraficoLatencia() {
    let paisSelecionado = sessionStorage.getItem("paisSelecionado") || "GLOBAL";

    let historico;
    let tituloDataset;

    if (paisSelecionado === "GLOBAL") {
        historico = await buscarHistorico7Dias();
        tituloDataset = "Latência Global";
    } else {
        historico = await buscarHistoricoPais7Dias(paisSelecionado);
        tituloDataset = `Latência ${paisSelecionado}`;
    }

    const ctx = document.getElementById("bfChart");
    if (!ctx) return;

    if (!historico || historico.length == 0) {
        if (chartBF) chartBF.destroy();
        const c = ctx.getContext("2d");
        c.clearRect(0, 0, ctx.width, ctx.height);
        c.font = "18px Poppins";
        c.fillStyle = "#999";
        c.textAlign = "center";
        c.fillText("Sem dados", ctx.width / 2, ctx.height / 2);
        return;
    }

    const labels = historico.map(h => {
        const [ano, mes, dia] = h.data.split('-');
        return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'short'
        });
    });

    const valores = historico.map(h => h.media);
    const PICO_IDEAL = 85;

    if (chartBF) chartBF.destroy();

    chartBF = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: tituloDataset,
                    data: valores,
                    borderColor: "#000000",
                    backgroundColor: "#fff",
                    tension: 0.4,
                    borderWidth: 5,
                    pointRadius: 10,
                    pointHoverRadius: 14,
                    pointBackgroundColor: "#0000ff",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 4,
                    pointHoverBorderWidth: 5,
                    fill: true
                },
                {
                    label: "Pico Ideal",
                    data: Array(7).fill(PICO_IDEAL),
                    borderColor: "#4caf50",
                    borderDash: [10, 6],
                    borderWidth: 3,
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 15, weight: "600", family: "Poppins" },
                        color: "#333",
                        usePointStyle: true,
                        padding: 25,
                        filter: (item) => item.text.includes("Latência") || item.text === "Pico Ideal"
                    }
                },
                title: { display: false },
                tooltip: {
                    backgroundColor: "rgba(0,0,0,0.85)",
                    titleFont: { size: 14 },
                    bodyFont: { size: 16, weight: "600" },
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: false,
                    callbacks: {
                        label: (ctx) => {
                            if (ctx.dataset.label == "Pico Ideal") return null;
                            return ctx.parsed.y + " ms";
                        }
                    }

                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 14 }, color: "#555" }
                },
                y: {
                    grid: { color: "rgba(0,0,0,0.04)", drawBorder: false },
                    ticks: {
                        font: { size: 14 },
                        color: "#555",
                        padding: 10,
                        callback: v => v + "ms"
                    }
                }
            }
        }
    });
}

function atualizarGraficoLatenciaComDados(historico) {
    sessionStorage.setItem("paisSelecionado", "GLOBAL");
    atualizarGraficoLatencia();
}
function atualizarGraficoLatenciaComDados(historico) {
    const ctx = document.getElementById("bfChart");
    if (!ctx) return;

    if (!historico || historico.length === 0) {
        if (chartBF) chartBF.destroy();
        const c = ctx.getContext("2d");
        c.clearRect(0, 0, ctx.width, ctx.height);
        c.font = "18px Poppins";
        c.fillStyle = "#444";
        c.textAlign = "center";
        c.fillText("Sem dados", ctx.width / 2, ctx.height / 2);
        return;
    }

    const labels = historico.map(h => {
        const [a, m, d] = h.data.split('-');
        return new Date(a, m-1, d).toLocaleDateString('pt-BR', {day:'numeric', month:'short'});
    });

    const valores = historico.map(h => h.media);
    const anoPassado = valores.map(v => Math.round(v * (0.85 + Math.random() * 0.3)));

    if (chartBF) {
        chartBF.data.labels = labels;
        chartBF.data.datasets[0].data = anoPassado;
        chartBF.data.datasets[1].data = valores;
        chartBF.options.plugins.title = {display:true, text:"Latência Média Global"};
        chartBF.update();
        return;
    }

    chartBF = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {label:"Semana passada",data:anoPassado,borderColor:"#d32f2f",tension:0.35,borderWidth:2,fill:false},
                {label:"Latência Global",data:valores,borderColor:"#1e88e5",tension:0.35,borderWidth:4,fill:false,pointRadius:5},
                {label:"Pico Ideal",data:Array(7).fill(90),borderColor:"#4caf50",borderDash:[8,4],borderWidth:2,pointRadius:0}
            ]
        },
        options: {
            responsive:true,
            maintainAspectRatio:false,
            plugins:{legend:{display:false},title:{display:true,text:"Latência Média Global"}},
            scales:{y:{suggestedMax:200,ticks:{callback:v=>v+'ms'}}}
        }
    });
}