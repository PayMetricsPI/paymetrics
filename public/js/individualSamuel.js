let pingRealtimeCache = null;

async function carregarPingRealtime() {
    if (pingRealtimeCache) return pingRealtimeCache;

    try {
        const resp = await fetch("/latencia.json");  // arquivo gerado pelo Python
        pingRealtimeCache = await resp.json();
        return pingRealtimeCache;
    } catch (e) {
        console.error("Erro ao carregar latência do Python:", e);
        return {};
    }
}

function nomePais(sigla) {
    const mapa = {
        BR: "Brasil",
        US: "Estados Unidos",
        CA: "Canadá",
        JP: "Japão",
        FR: "França"
    };
    return mapa[sigla] || sigla;
}
async function gerarPingPais(pais) {
    const dados = await carregarPingRealtime();

    if (dados[pais] && dados[pais].media != null) {
        return Math.round(dados[pais].media);
    }

    return Math.floor(Math.random() * (200 - 30) + 30); // fallback
}


async function gerarPingEstado(pais, estado) {
    const dados = await carregarPingRealtime();

    if (dados[pais] && dados[pais].estados) {
        const entry = Object.entries(dados[pais].estados)
            .find(([k, v]) => k.startsWith(estado + "_"));

        if (entry) {
            return entry[1]; // valor da latência
        }
    }

    return await gerarPingPais(pais);
}


function getEmpresa() {
    return sessionStorage.getItem("id");
}

async function obterMapaGlobal() {
    const fk = getEmpresa();
    if (!fk) return [];

    const url = `/servidores/mapa/${fk}`;
    console.log(" MAPA GLOBAL Buscando:", url);

    try {
        const resp = await fetch(url);
        const texto = await resp.text();
        console.log(" Resposta Global:", texto);

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

    console.log(" mapa estados Buscando:", url);

    try {
        const resp = await fetch(url);
        const texto = await resp.text();
        console.log(" Resposta Estados:", texto);

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
function buscarDados() {
    const servidorSelecionado = JSON.parse(sessionStorage.getItem('servidorSelecionado'));

    if (!servidorSelecionado) return;

    const mac = servidorSelecionado.mac_address;

    fetch(`/metrica/obterUltimaPorMAC/${mac}`)
        .then(r => r.json())
        .then(data => {
           
            atualizarLatenciaMediaGlobal(data.ping_amazon);
        })
        .catch(() => console.log("rode o python"));
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
    const DiaAtual = hoje.getDay();
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

async function atualizarCardEventos(pais = "BR") {
    const evento = await obterEventoDoMes(pais);
    if (!evento) return;

    const nome = document.getElementById("eventoNome");
    const data = document.getElementById("eventoData");
    const diasRest = document.getElementById("eventoDias");
    const barra = document.getElementById("barraProgresso");

    if (!evento) {
        nome.textContent = "Nenhum evento próximo";
        data.textContent = "";
        diasRest.textContent = "";
        barra.style.width = "0%";
        return;
    }

    const hoje = new Date();
    const dataEvento = new Date(evento.date);
    const dias = diasRestantesEvento(evento.date);

    nome.textContent = evento.name;
    data.textContent = dataEvento.toLocaleDateString("pt-BR");
    diasRest.textContent = `Faltam ${dias} dias`;

    if (dias <= 3) {
        diasRest.style.color = "red";
    } else if (dias <= 7) {
        diasRest.style.color = "orange";
    } else {
        diasRest.style.color = "green";
    }

    const diaHoje = hoje.getDate();
    const diaEvento = dataEvento.getDate();
    const perc = Math.min((diaHoje / diaEvento) * 100, 100);
    barra.style.width = perc + "%";
}

function atualizarLatenciaMediaGlobal(valor) {
    const elemento = document.querySelector(".mini-card:nth-child(3) .mini-value");
    if (elemento) elemento.textContent = `${valor}ms`;
}

function atualizarTabela(lista) {
    const tableBody = document.querySelector(".latency-table tbody"); 

    if (!tableBody || !lista || lista.length === 0) {
        if(tableBody) tableBody.innerHTML = `<tr><td colspan="4">Nenhum servidor encontrado</td></tr>`;
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



document.addEventListener("DOMContentLoaded", () => {
    btnVoltar = document.querySelector(".btn-voltar"); 
    atualizarCardEventos();
    preencherSelectPaises(); 
});

document.addEventListener("DOMContentLoaded", () => {
    btnVoltar = document.querySelector(".btn-voltar"); 
    atualizarCardEventos();
    preencherSelectPaises(); 

    const select = document.getElementById("idSelect");

    if (select) {
        select.addEventListener("change", async (ev) => {
            const pais = ev.target.value;

            await atualizarCardEventos(pais);

            const estados = await obterMapaEstados(pais);

            if (estados.length > 0) {
                exibirEstados(pais, estados);
            } else {
                const lat = await gerarPingPais(pais);
                atualizarTabela([{ nome: pais, latencia: lat }]);

            }
        });
    } else {
        console.error("ERRO: idSelect NÃO existe no DOM.");
    }
});

const mapasPais = {
    BR: anychart.maps.brazil,
    US: anychart.maps.united_states_of_america,
    CA: anychart.maps.canada,
    FR: anychart.maps.france,
    JP: anychart.maps.japan
};


anychart.onDocumentReady(() => {
    iniciarMapa();
    buscarDados();
});



async function iniciarMapa() {
    const dataGlobal = await obterMapaGlobal();

    // pega a latência real
    for (const item of dataGlobal) {
        item.value = await gerarPingPais(item.id);
        item.latency = item.value;
    }

    const media = Math.round(
        dataGlobal.reduce((acc, e) => acc + (e.latency || 0), 0) / (dataGlobal.length || 1)
    );
    atualizarLatenciaMediaGlobal(media);

    mapa = anychart.map();
    mapa.container("miniMapa");
    mapa.geoData(anychart.maps.world);

    mapa.background().fill("#fff");
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

    for (const e of dataGlobal) {
        e.fill =
            e.value < 90 ? "#4CAF50" :
            e.value < 120 ? "#FFC107" :
                            "#D32F2F";
    }

    scale.colors(["#4CAF50", "#FFC107", "#D32F2F"]);

    let series = mapa.bubble(dataGlobal);
    series.geoIdField("id");
    series.size("size");
    series.fill("fill");

    series.color(function() {
        const v = this.get("value");
        if (v < 90) return "#4CAF50";
        if (v < 120) return "#FFC107";
        return "#D32F2F";
    });

    series.hovered().fill(function() {
        const v = this.get("value");
        if (v < 90) return "#66BB6A";
        if (v < 120) return "#FFCA28";
        return "#E57373";
    });

    series.selected().fill(function() {
        const v = this.get("value");
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

    let chartBF = null;

    series.listen("pointClick", async e => {
        const pais = e.point.get("id");
        atualizarCard(1, pais);
        await atualizarCardEventos(pais);

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
            latencia: e.latency
        }))
    );

    atualizarCard(
        dataGlobal.reduce((a, b) => a + b.size, 0),
        "Servidores Globais"
    );
}


async function exibirEstados(pais, dadosEstados) {
    const mapaPais = mapasPais[pais];

    if (!mapaPais) {
        console.warn("nenhum mapa disponível para o país:", pais);
        return;
    }

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

    if(btnVoltar) btnVoltar.classList.remove("show");

    await atualizarCardEventos("BR");
}

const ctx = document.getElementById("bfChart");

const hoje = new Date;
let mesAtualIndex  = hoje.getMonth();
const DiaAtual = hoje.getDate();

const mesLista = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez"
];

let mesAtual = mesLista[mesAtualIndex];
function gerarUltimos7Dias() {
    const dias = [];
    const hoje = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(hoje.getDate() - i);

        const dia = d.getDate();
        const mes = mesLista[d.getMonth()];

        dias.push(`${mes} ${dia}`);
    }

    return dias;
}

async function gerarLabelsComEventos(pais = "BR") {
    const labels = gerarUltimos7Dias();
    const evento = await obterEventoDoMes(pais);

    if (!evento) return labels;

    const dataEvento = new Date(evento.date);

    return labels.map(lb => {
        const [mesTexto, diaTexto] = lb.split(" ");
        const dia = Number(diaTexto);

        const dt = new Date();
        dt.setMonth(mesLista.indexOf(mesTexto));
        dt.setDate(dia);

        if (dt.toDateString() === dataEvento.toDateString()) {
            return `${lb} — ${evento.name}`;
        }

        return lb;
    });
}
function gerarValoresAleatorios() {
    const valores = [];
    for (let i = 0; i < 7; i++) {
        valores.push(Math.floor(Math.random() * 50) + 80);
    }
    return valores;
}
async function preencherSelectPaises() {
    const fk = getEmpresa();
    if (!fk) return;

    try {
        const resp = await fetch(`/servidores/mapa/${fk}`);
        const texto = await resp.text();
        const dados = JSON.parse(texto);

  
        const select = document.getElementById("selectPais");
        select.innerHTML = ""; 

       
        dados.forEach(item => {
            const pais = item.pais;

            const option = document.createElement("option");
            option.value = pais;
            option.textContent = nomePais(pais);  
            select.appendChild(option);
        });

    } catch (e) {
        console.error("Erro ao carregar países no select:", e);
    }
}

async function buscarTrafegoUltimos7Dias() {
    const r = await fetch("/metrica/trafego7dias");
    return await r.json();
}
(async () => {

    const labels = await gerarLabelsComEventos("BR");

    const trafegoAtual = gerarValoresAleatorios();
    const anoPassado   = gerarValoresAleatorios();

    chartBF = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Ano Passado",
                    data: anoPassado,
                    borderColor: "#d32f2f",
                    tension: 0.35,
                    borderWidth: 3,
                    fill: false,
                    pointRadius: 0
                },
                {
                    label: "Tráfego Atual",
                    data: trafegoAtual,
                    borderColor: "#1e88e5",
                    backgroundColor: "#1e88e5",
                    tension: 0.35,
                    borderWidth: 4,
                    fill: false
                },
                {
                    label: "Pico Ideal",
                    data: Array(7).fill(130),
                    borderColor: "green",
                    borderDash: [6,6],
                    tension: 0.35,
                    borderWidth: 3,
                    fill: false,
                    pointRadius: 0
                },
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 13, weight: "600" } }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: "rgba(0,0,0,0.05)" },
                    ticks: { font: { size: 13, weight: "600" } }
                }
            }
        }
    });

})();
    setInterval(() => {
    if (!chartBF) return;

    const novosValores = gerarValoresAleatorios();

    // Atualiza só o último ponto (index 6)
chartBF.data.datasets[1].data[6] = Math.floor(Math.random() * 50) + 80;
    chartBF.update();
}, 10000); 

