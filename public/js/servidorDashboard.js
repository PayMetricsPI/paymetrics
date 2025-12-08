const usersDiv = document.querySelector('.users');
const fkempresa = Number(sessionStorage.getItem('id'));
const servidor = JSON.parse(sessionStorage.getItem('servidorSelecionado'));

console.log('=== DEBUG SERVIDOR ===');
console.log('SERVIDOR BRUTO:', servidor);
console.log('TODOS OS CAMPOS:', Object.keys(servidor || {}));
console.log('MAC POSSÍVEIS:', servidor?.mac_adress, servidor?.mac_address, servidor?.macadress, servidor?.mac);
console.log('CODIGO MAQUINA:', servidor?.codigo_maquina);
console.log('====================');

console.log({
    alerta_numero_critico: document.getElementById('alerta_numero_critico'),
    critico_CPU: document.getElementById('critico_CPU'),
    critico_RAM: document.getElementById('critico_RAM'),
    critico_Disco: document.getElementById('critico_Disco')
});


// Variáveis dos gráficos
let cpuChart = null;
let ramChart = null;
let discoChart = null;
let redeChart = null;
let redeChart2 = null;
let chartCPU = null;
let chartRAM = null;
let chartDisco = null;
let chartMBEnviados = null;
let chartMBRecebidos = null;

// Váriaveis dos alertas
let alertaCPU = null;
let alertaRAM = null;
let alertaDisco = null;
let alertaDownload = null;
let alertaUpload = null;

let alertaCriticoCPU = null;
let alertaCriticoRAM = null;
let alertaCriticoDisco = null;
let alertaCriticoDownload = null;
let alertaCriticoUpload = null;

let somaAlertaCriticos = null;
let somaAlertas = null;

let dadosPorPeriodo = { 1: [], 2: [], 3: [], 4: [] };

//Variáveis dos limites/parâmetros
let limites = {
    cpu: { normal: 60, critico: 80 },
    ram: { normal: 60, critico: 80 },
    disco: { normal: 60, critico: 80 },
    mbEnviados: { normal: 60, critico: 80 },
    mbRecebidos: { normal: 60, critico: 80 }
};

// Variáveis globais
let data = [];

let estatisticasAlertas = null;

function parseLocalDateTime(dt) {
    const [date, time] = dt.split(' ');
    const [y, m, d] = date.split('-');
    const [hh, mm, ss] = time.split(':');
    return new Date(y, m - 1, d, hh, mm, ss);
}


// Converte data_alerta para timestamp
function paraTimestamp(dateString) {
    return new Date(dateString.replace(" ", "T")).getTime();
}

function carregarDados() {
    return fetch('/s3/downloadJSON')
        .then(response => response.json())
        .then(response => {

            data = response.data.flat();
            console.log("TOTAL CARREGADO:", data.length);

            separarPorPeriodo(data);

        })
        .catch(err => console.error('ERRO S3:', err));
}

function calcularAlertas(dataFiltro = data) {
    console.log('CALCULANDO alertas com', dataFiltro.length, 'linhas brutas');

    if (servidor) {
        const mac = servidor.mac_address
        console.log('MAC CORRIGIDO:', mac)

        const servidorData = dataFiltro.filter(row => row.mac_address === mac);
        console.log('SERVIDOR DATA após filtro MAC:', servidorData.length, 'linhas')

        console.log('RAM críticos no período:',
            servidorData.filter(r => r.ram_status_critico === 'CRITICO').length
        );
        console.log('DISCO críticos no período:',
            servidorData.filter(r => r.disco_status_critico === 'CRITICO').length
        );
        console.log('CPU críticos no período:',
            servidorData.filter(r => r.cpu_status_critico === 'CRITICO').length
        );

        console.log('SERVIDOR DATA após filtro MAC:', servidorData.length, 'linhas');

        alertaCPU = servidorData.filter(row => row.cpu_status === "NORMAL").length;
        alertaRAM = servidorData.filter(row => row.ram_status === "NORMAL").length;
        alertaDisco = servidorData.filter(row => row.disco_status === "NORMAL").length;
        alertaDownload = servidorData.filter(row => row.mb_recebidos_status === "NORMAL").length;
        alertaUpload = servidorData.filter(row => row.mb_enviados_status === "NORMAL").length;

        alertaCriticoCPU = servidorData.filter(row => row.cpu_status_critico === "CRITICO").length;
        alertaCriticoRAM = servidorData.filter(row => row.ram_status_critico === "CRITICO").length;
        alertaCriticoDisco = servidorData.filter(row => row.disco_status_critico === "CRITICO").length;
        alertaCriticoDownload = servidorData.filter(row => row.mb_recebidos_status_critico === "CRITICO").length;
        alertaCriticoUpload = servidorData.filter(row => row.mb_enviados_status_critico === "CRITICO").length;

        somaAlertas = alertaCPU + alertaRAM + alertaDisco + alertaDownload + alertaUpload;
        somaAlertaCriticos = alertaCriticoCPU + alertaCriticoRAM + alertaCriticoDisco + alertaCriticoDownload + alertaCriticoUpload;

        estatisticasAlertas = {
            normal: [alertaCPU, alertaRAM, alertaDisco, alertaUpload, alertaDownload],
            critico: [alertaCriticoCPU, alertaCriticoRAM, alertaCriticoDisco, alertaCriticoUpload, alertaCriticoDownload]
        };

        // Atualizar contadores
        document.getElementById('alerta_numero_padrao').textContent = somaAlertas;
        document.getElementById('alerta_numero_critico').textContent = somaAlertaCriticos;
        document.getElementById('critico_CPU').textContent = alertaCriticoCPU;
        document.getElementById('padrao_CPU').textContent = alertaCPU;
        document.getElementById('critico_RAM').textContent = alertaCriticoRAM;
        document.getElementById('padrao_RAM').textContent = alertaRAM;
        document.getElementById('critico_Disco').textContent = alertaCriticoDisco;
        document.getElementById('padrao_Disco').textContent = alertaDisco;
        document.getElementById('critico_Download').textContent = alertaCriticoDownload;
        document.getElementById('padrao_Download').textContent = alertaDownload;
        document.getElementById('critico_Upload').textContent = alertaCriticoUpload;
        document.getElementById('padrao_Upload').textContent = alertaUpload;

        document.getElementById('servidorNome').textContent = servidor.nome;
        document.getElementById('modelo_cpu').textContent = servidor.tipocpu;
        document.getElementById('capacidade_ram').textContent = servidor.ram + 'GB';
        document.getElementById('capacidade_disco').textContent = servidor.disco + 'TB';
    }
}

function separarPorPeriodo(todasLinhas) {
    const agora = Date.now();
    dadosPorPeriodo = { 1: [], 2: [], 3: [], 4: [] };

    todasLinhas.forEach((row, i) => {
        if (!row.data_alerta) return;
        const ts = parseLocalDateTime(row.data_alerta);
        const diffHoras = (agora - ts) / (1000 * 60 * 60);

        if (i < 10) {
            console.log('AMOSTRA', i, row.data_alerta, '→ diffHoras =', diffHoras.toFixed(1));
        }


        if (diffHoras <= 1) dadosPorPeriodo[1].push(row);


        if (diffHoras <= 24) dadosPorPeriodo[2].push(row);


        const inicio3Dias = new Date();
        inicio3Dias.setHours(0, 0, 0, 0);
        inicio3Dias.setDate(inicio3Dias.getDate() - 2);
        if (ts >= inicio3Dias.getTime()) dadosPorPeriodo[3].push(row);


        const inicio7Dias = new Date();
        inicio7Dias.setHours(0, 0, 0, 0);
        inicio7Dias.setDate(inicio7Dias.getDate() - 6);
        if (ts >= inicio7Dias.getTime()) dadosPorPeriodo[4].push(row);
    });

    console.log('PERÍODOS CORRETOS:', {
        '1H': dadosPorPeriodo[1].length,
        '1D': dadosPorPeriodo[2].length,
        '3D': dadosPorPeriodo[3].length,
        '7D': dadosPorPeriodo[4].length
    });
}

function gerarLabelsDinamicas(periodo) {
    const agora = new Date();
    let labels = [];

    if (periodo == 1) { // últimos 60 min, blocos de 15 min
        for (let i = 60; i >= 0; i -= 15) {
            const t = new Date(agora.getTime() - i * 60000);
            labels.push(t.toTimeString().slice(0, 5)); // "HH:MM"
        }
    } else if (periodo == 2) { // últimas 24h, blocos de 6h
        for (let i = 24; i >= 0; i -= 6) {
            const t = new Date(agora.getTime() - i * 3600000);
            labels.push(t.toTimeString().slice(0, 5));
        }
    } else if (periodo == 3) { // últimos 3 dias, label por dia
        const inicioPeriodo = new Date();
        inicioPeriodo.setHours(0, 0, 0, 0); // início de hoje
        inicioPeriodo.setDate(inicioPeriodo.getDate() - 2); // 3 dias

        for (let i = 0; i < 3; i++) {
            const t = new Date(inicioPeriodo);
            t.setDate(t.getDate() + i);
            labels.push(t.toLocaleDateString("pt-BR", { weekday: "short" }));
        }
    } else if (periodo == 4) { // últimos 7 dias, label por dia
        const inicioPeriodo = new Date();
        inicioPeriodo.setHours(0, 0, 0, 0); // início de hoje
        inicioPeriodo.setDate(inicioPeriodo.getDate() - 6); // 7 dias

        for (let i = 0; i < 7; i++) {
            const t = new Date(inicioPeriodo);
            t.setDate(t.getDate() + i);
            labels.push(t.toLocaleDateString("pt-BR", { weekday: "short" }));
        }
    }

    return labels;
}

function formatarDiferenca(timestamp) {
    const agora = Date.now();
    const diffSegundos = Math.abs(agora - timestamp) / 1000;
    const dias = Math.floor(diffSegundos / 60 / 60 / 24);
    const horas = Math.floor(diffSegundos / 60 / 60 % 24);
    const minutos = Math.floor(diffSegundos / 60 % 60);
    return `${dias.toString().padStart(2, '0')}d ${horas.toString().padStart(2, '0')}h ${minutos.toString().padStart(2, '0')}m`;
}

function buscarDados() {

    //Buscar métricas para atualizar os dunets
    fetch(`/metrica/obterUltimaPorMAC/${servidor.mac_address}`)
        .then(r => r.json())
        .then(data => {
            atualizarCPU(data.cpu);
            atualizarRAM(data.ram);
            atualizarDisco(data.disco);
            atualizarMBEnviados(data.mbEnviados);
            atualizarMBRecebidos(data.mbRecebidos);
            atualizarBootTime(data.tempoBoot);
        })
        .catch(() => console.log("rode o python :)"));


    // Buscar parâmetros
    const id_servidor = JSON.parse(sessionStorage.getItem('servidorSelecionado')).id_servidor;

    fetch(`/parametro/${id_servidor}`)
        .then(r => r.json())
        .then(data => {

            for (let i = 0; i < data.length; i++) {

                if (data[i].nome === "CPU") {
                    document.getElementById('lim_padrao_cpu').innerHTML = data[i].alerta_normal + "%";
                    document.getElementById('lim_critico_cpu').innerHTML = data[i].alerta_critico + "%";
                    limites.cpu.normal = Number(data[i].alerta_normal);
                    limites.cpu.critico = Number(data[i].alerta_critico);

                } else if (data[i].nome === "RAM") {
                    document.getElementById('lim_padrao_ram').innerHTML = data[i].alerta_normal + "%";
                    document.getElementById('lim_critico_ram').innerHTML = data[i].alerta_critico + "%";
                    limites.ram.normal = Number(data[i].alerta_normal);
                    limites.ram.critico = Number(data[i].alerta_critico);

                } else if (data[i].nome === "DISCO") {
                    document.getElementById('lim_padrao_disco').innerHTML = data[i].alerta_normal + "%";
                    document.getElementById('lim_critico_disco').innerHTML = data[i].alerta_critico + "%";
                    limites.disco.normal = Number(data[i].alerta_normal);
                    limites.disco.critico = Number(data[i].alerta_critico);

                } else if (data[i].nome === "Mb Enviados - REDE") {
                    document.getElementById('lim_padrao_upload').innerHTML = data[i].alerta_normal + "%";
                    document.getElementById('lim_critico_upload').innerHTML = data[i].alerta_critico + "%";
                    limites.mbEnviados.normal = Number(data[i].alerta_normal);
                    limites.mbEnviados.critico = Number(data[i].alerta_critico);

                } else if (data[i].nome === "Mb Recebidos - REDE") {
                    document.getElementById('lim_padrao_download').innerHTML = data[i].alerta_normal + "%";
                    document.getElementById('lim_critico_download').innerHTML = data[i].alerta_critico + "%";
                    limites.mbRecebidos.normal = Number(data[i].alerta_normal);
                    limites.mbRecebidos.critico = Number(data[i].alerta_critico);
                }
            }

            console.log("LIMITES ATUALIZADOS:", limites);
        });

    // definição do tempo para atualizar os dunets
    setTimeout(buscarDados, 5000); // atualiza a cada 5s
}


// Funções para atualizar cada gráfico de dunets
function atualizarCPU(valorCPU) {
    if (!chartCPU) return;

    let cor = "green";
    if (valorCPU >= limites.cpu.critico) cor = "#E53935";
    else if (valorCPU >= limites.cpu.normal) cor = "#F4B000";

    chartCPU.data.datasets[0].backgroundColor = [cor, "#ccc"];
    chartCPU.data.datasets[0].data = [valorCPU, 100 - valorCPU];
    chartCPU.update();
}

function atualizarRAM(valorRAM) {
    if (!chartRAM) return;

    let cor = "green";
    if (valorRAM >= limites.ram.critico) cor = "#E53935";
    else if (valorRAM >= limites.ram.normal) cor = "#F4B000";

    chartRAM.data.datasets[0].backgroundColor = [cor, "#ccc"];
    chartRAM.data.datasets[0].data = [valorRAM, 100 - valorRAM];
    chartRAM.update();
}

function atualizarDisco(valorDisco) {
    if (!chartDisco) return;

    let cor = "green";
    if (valorDisco >= limites.disco.critico) cor = "#E53935";
    else if (valorDisco >= limites.disco.normal) cor = "#F4B000";

    chartDisco.data.datasets[0].backgroundColor = [cor, "#ccc"];
    chartDisco.data.datasets[0].data = [valorDisco, 100 - valorDisco];
    chartDisco.update();
}

function atualizarMBRecebidos(valorMbRecebidos) {
    if (!chartMBRecebidos) return;

    let cor = "green";
    if (valorMbRecebidos >= limites.mbRecebidos.critico) cor = "#E53935";
    else if (valorMbRecebidos >= limites.mbRecebidos.normal) cor = "#F4B000";

    chartMBRecebidos.data.datasets[0].backgroundColor = [cor, "#ccc"];
    chartMBRecebidos.data.datasets[0].data = [valorMbRecebidos, 100 - valorMbRecebidos];
    chartMBRecebidos.update();
}

function atualizarMBEnviados(valorMbEnviados) {
    if (!chartMBEnviados) return;

    let cor = "green";
    if (valorMbEnviados >= limites.mbEnviados.critico) cor = "#E53935";
    else if (valorMbEnviados >= limites.mbEnviados.normal) cor = "#F4B000";

    chartMBEnviados.data.datasets[0].backgroundColor = [cor, "#ccc"];
    chartMBEnviados.data.datasets[0].data = [valorMbEnviados, 100 - valorMbEnviados];
    chartMBEnviados.update();
}

// Função para contar os alertas por período

function contarAlertasPorPeriodo(blocoDados, metrica) {
    if (!blocoDados || !Array.isArray(blocoDados)) return 0;
    return blocoDados.filter(row => row[metrica] && row[metrica] == "NORMAL").length;
}

console.log({
    alerta_numero_critico: document.getElementById('alerta_numero_critico'),
    critico_CPU: document.getElementById('critico_CPU'),
    critico_RAM: document.getElementById('critico_RAM'),
    critico_Disco: document.getElementById('critico_Disco')
});



// Função para colocar os alertas padrões e críticos nos gráficos
function distribuirAlertasNasLabels(dataFiltro, labels, periodo) {

    const contCPU = Array(labels.length).fill(0);
    const contCPUCritico = Array(labels.length).fill(0);
    const contRAM = Array(labels.length).fill(0);
    const contRAMCritico = Array(labels.length).fill(0);
    const contDisco = Array(labels.length).fill(0);
    const contDiscoCritico = Array(labels.length).fill(0);
    const contDownload = Array(labels.length).fill(0);
    const contDownloadCritico = Array(labels.length).fill(0);
    const contUpload = Array(labels.length).fill(0);
    const contUploadCritico = Array(labels.length).fill(0);

    let inicioPeriodo;

    // Definição do período com base na multiplicação dos segundos pelos minutos/horas
    if (periodo == 1) {
        inicioPeriodo = new Date(Date.now() - 60 * 60000);
    } else if (periodo == 2) {
        inicioPeriodo = new Date(Date.now() - 24 * 3600000);
    } else if (periodo == 3) {
        inicioPeriodo = new Date();
        inicioPeriodo.setHours(0, 0, 0, 0);
        inicioPeriodo.setDate(inicioPeriodo.getDate() - 2);
    } else if (periodo == 4) {
        inicioPeriodo = new Date();
        inicioPeriodo.setHours(0, 0, 0, 0);
        inicioPeriodo.setDate(inicioPeriodo.getDate() - 6);
    }



    dataFiltro.forEach(row => {
        if (!row.data_alerta) return;
        const ts = new Date(row.data_alerta.replace(' ', 'T'));

        let index = -1;

        if (periodo == 1) {
            index = Math.floor((ts - inicioPeriodo) / (15 * 60000));
        } else if (periodo == 2) {
            index = Math.floor((ts - inicioPeriodo) / (6 * 3600000));
        } else if (periodo == 3) {
            index = Math.floor((ts - inicioPeriodo) / 86400000);
        } else if (periodo == 4) {
            index = Math.floor((ts - inicioPeriodo) / 86400000);
        }

        if (index < 0 || index >= labels.length) return;

        if (row.cpu_status === "NORMAL") contCPU[index]++;
        if (row.cpu_status_critico === "CRITICO") contCPUCritico[index]++;
        if (row.ram_status === "NORMAL") contRAM[index]++;
        if (row.ram_status_critico === "CRITICO") contRAMCritico[index]++;
        if (row.disco_status === "NORMAL") contDisco[index]++;
        if (row.disco_status_critico === "CRITICO") contDiscoCritico[index]++;
        if (row.mb_recebidos_status === "NORMAL") contDownload[index]++;
        if (row.mb_recebidos_status_critico === "CRITICO") contDownloadCritico[index]++;
        if (row.mb_enviados_status === "NORMAL") contUpload[index]++;
        if (row.mb_enviados_status_critico === "CRITICO") contUploadCritico[index]++;
    });

    return { contCPU, contCPUCritico, contRAM, contRAMCritico, contDisco, contDiscoCritico, contDownload, contDownloadCritico, contUpload, contUploadCritico };
}

function getMAC(servidor) {
    return servidor.mac_address
        || servidor.mac_adress
        || servidor.macAdress
        || servidor.mac
        || null;
}

// Função para atualizar os gráficos destruindo e reconstruindo eles
function atualizarGraficoPorPeriodo(periodo) {

    const mac = getMAC(servidor);

    const dataPeriodo = dadosPorPeriodo[periodo] || [];

    if (!Array.isArray(dataPeriodo)) {
        console.error("dadosPorPeriodo[periodo] NÃO É UM ARRAY!", dadosPorPeriodo);
        return;
    }

    if (cpuChart) cpuChart.destroy();
    if (ramChart) ramChart.destroy();
    if (discoChart) discoChart.destroy();
    if (redeChart) redeChart.destroy();
    if (redeChart2) redeChart2.destroy();
    if (chartMBEnviados) chartMBEnviados.destroy();
    if (chartMBRecebidos) chartMBRecebidos.destroy();
    if (chartCPU) chartCPU.destroy();
    if (chartRAM) chartRAM.destroy();
    if (chartDisco) chartDisco.destroy();



    // Dados por período
    const dataFiltro = dadosPorPeriodo[periodo].filter(row => row.mac_address === mac);

    calcularAlertas(dataFiltro);

    const labels = gerarLabelsDinamicas(periodo);

    const distribuicao = distribuirAlertasNasLabels(dataFiltro, labels, periodo);


    // Diferenciação dos períodos
    if (periodo === "1") {

        const {
            contCPU,
            contCPUCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        ctxCpu = document.getElementById('CpuChart').getContext('2d');
        cpuChart = new Chart(ctxCpu, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contCPU,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contCPUCritico,
                        backgroundColor: '#E53935',
                        borderWidth: 1,
                        borderRadius: 10,
                    }
                ],
                borderWidth: 1,
                borderRadius: 12,
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - CPU',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });


        const canvasStatus = document.getElementById('statusChart');
        const existingStatus = Chart.getChart(canvasStatus);
        if (existingStatus) {
            existingStatus.destroy();
        }

        chartCPU = new Chart(canvasStatus, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'CPU',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });

        const {
            contRAM,
            contRAMCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        const ctxram = document.getElementById('RamChart').getContext('2d');

        ramChart = new Chart(ctxram, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contRAM,
                        backgroundColor: '#F4B000',
                        stack: 'alerts',
                        borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contRAMCritico,
                        backgroundColor: '#E53935',
                        borderWidth: 1,
                        borderRadius: 10,
                    }
                ],
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - RAM',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });

        const canvasStatusram = document.getElementById('statusRamChart');
        const existingStatusram = Chart.getChart(canvasStatusram);
        if (existingStatusram) {
            existingStatusram.destroy();
        }

        chartRAM = new Chart(canvasStatusram, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'Ram',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });

        const {
            contDisco,
            contDiscoCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        const ctxdisco = document.getElementById('DiscoChart').getContext('2d');

        discoChart = new Chart(ctxdisco, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contDisco,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contDiscoCritico,
                        backgroundColor: '#E53935', borderWidth: 1,
                        borderRadius: 10,
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - Disco',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });


        const canvasStatusdisco = document.getElementById('statusDiscoChart');
        const existingStatusdisco = Chart.getChart(canvasStatusdisco);
        if (existingStatusdisco) {
            existingStatusdisco.destroy();
        }

        chartDisco = new Chart(canvasStatusdisco, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'Disco',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });

        const {
            contDownload,
            contDownloadCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        const ctxrede = document.getElementById('RedeChart').getContext('2d');

        redeChart = new Chart(ctxrede, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contDownload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contDownloadCritico,
                        backgroundColor: '#E53935', borderWidth: 1,
                        borderRadius: 10,
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - Download',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });


        const canvasStatusrede1 = document.getElementById('statusRedeChart');
        const existingStatusrede1 = Chart.getChart(canvasStatusrede1);
        if (existingStatusrede1) {
            existingStatusrede1.destroy();
        }

        chartMBEnviados = new Chart(canvasStatusrede1, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'Rede',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });

        const {
            contUpload,
            contUploadCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        ctxrede2 = document.getElementById('RedeChart2').getContext('2d');
        redeChart2 = new Chart(ctxrede2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contUpload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contUploadCritico,
                        backgroundColor: '#E53935', borderWidth: 1,
                        borderRadius: 10,
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - Upload',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });

        const canvasStatusrede2 = document.getElementById('statusRedeChart2');
        const existingStatusrede2 = Chart.getChart(canvasStatusrede2);
        if (existingStatusrede2) {
            existingStatusrede2.destroy();
        }

        chartMBRecebidos = new Chart(canvasStatusrede2, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'Rede',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });

    }

    else if (periodo === "2") {

        const {
            contCPU,
            contCPUCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));


        const ctxCpu = document.getElementById('CpuChart').getContext('2d');
        cpuChart = new Chart(ctxCpu, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contCPU,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contCPUCritico,
                        backgroundColor: '#E53935', borderWidth: 1,
                        borderRadius: 10,
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - CPU',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });


        const canvasStatus = document.getElementById('statusChart');
        const existingStatus = Chart.getChart(canvasStatus);
        if (existingStatus) {
            existingStatus.destroy();
        }

        chartCPU = new Chart(canvasStatus, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'CPU',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });

        const {
            contRAM,
            contRAMCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        const ctxram = document.getElementById('RamChart').getContext('2d');

        ramChart = new Chart(ctxram, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contRAM,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contRAMCritico,
                        backgroundColor: '#E53935', borderWidth: 1,
                        borderRadius: 10,
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - RAM',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });

        const canvasStatusram = document.getElementById('statusRamChart');
        const existingStatusram = Chart.getChart(canvasStatusram);
        if (existingStatusram) {
            existingStatusram.destroy();
        }
        chartRAM = new Chart(canvasStatusram, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'Ram',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });

        const {
            contDisco,
            contDiscoCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        const ctxdisco = document.getElementById('DiscoChart').getContext('2d');

        discoChart = new Chart(ctxdisco, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contDisco,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contDiscoCritico,
                        backgroundColor: '#E53935', borderWidth: 1,
                        borderRadius: 10,
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - Disco',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });


        const canvasStatusdisco = document.getElementById('statusDiscoChart');
        const existingStatusdisco = Chart.getChart(canvasStatusdisco);
        if (existingStatusdisco) {
            existingStatusdisco.destroy();
        }

        chartDisco = new Chart(canvasStatusdisco, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'Disco',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });

        const {
            contDownload,
            contDownloadCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));


        const ctxrede = document.getElementById('RedeChart').getContext('2d');

        redeChart = new Chart(ctxrede, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contDownload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contDownloadCritico,
                        backgroundColor: '#E53935', borderWidth: 1,
                        borderRadius: 10,
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - Download',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });


        const canvasStatusrede = document.getElementById('statusRedeChart');
        const existingStatusrede = Chart.getChart(canvasStatusrede);
        if (existingStatusrede) {
            existingStatusrede.destroy();
        }

        chartMBEnviados = new Chart(canvasStatusrede, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'Rede',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });

        const {
            contUpload,
            contUploadCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        ctxrede2 = document.getElementById('RedeChart2').getContext('2d');
        redeChart2 = new Chart(ctxrede2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contUpload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contUploadCritico,
                        backgroundColor: '#E53935', borderWidth: 1,
                        borderRadius: 10,
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - Upload',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });

        const canvasStatusrede2 = document.getElementById('statusRedeChart2');
        const existingStatusrede2 = Chart.getChart(canvasStatusrede2);
        if (existingStatusrede2) {
            existingStatusrede2.destroy();
        }

        chartMBRecebidos = new Chart(canvasStatusrede2, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'Rede',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });

    }

    if (periodo === "3") {

        const {
            contCPU,
            contCPUCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        const ctxCpu = document.getElementById('CpuChart').getContext('2d');
        cpuChart = new Chart(ctxCpu, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contCPU,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contCPUCritico,
                        backgroundColor: '#E53935', borderWidth: 1,
                        borderRadius: 10,
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - CPU',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });


        const canvasStatus = document.getElementById('statusChart');
        const existingStatus = Chart.getChart(canvasStatus);
        if (existingStatus) {
            existingStatus.destroy();
        }

        chartCPU = new Chart(canvasStatus, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'CPU',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });

        const {
            contRAM,
            contRAMCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        const ctxram = document.getElementById('RamChart').getContext('2d');

        ramChart = new Chart(ctxram, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contRAM,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contRAMCritico,
                        backgroundColor: '#E53935', borderWidth: 1,
                        borderRadius: 10,
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - RAM',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });

        const canvasStatusram = document.getElementById('statusRamChart');
        const existingStatusram = Chart.getChart(canvasStatusram);
        if (existingStatusram) {
            existingStatusram.destroy();
        }

        chartRAM = new Chart(canvasStatusram, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'Ram',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });

        const {
            contDisco,
            contDiscoCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        const ctxdisco = document.getElementById('DiscoChart').getContext('2d');

        discoChart = new Chart(ctxdisco, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contDisco,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contDiscoCritico,
                        backgroundColor: '#E53935', borderWidth: 1,
                        borderRadius: 10,
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - Disco',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });


        const canvasStatusdisco = document.getElementById('statusDiscoChart');
        const existingStatusdisco = Chart.getChart(canvasStatusdisco);
        if (existingStatusdisco) {
            existingStatusdisco.destroy();
        }

        chartDisco = new Chart(canvasStatusdisco, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'Disco',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });

        const {
            contDownload,
            contDownloadCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        const ctxrede = document.getElementById('RedeChart').getContext('2d');

        redeChart = new Chart(ctxrede, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contDownload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contDownloadCritico,
                        backgroundColor: '#E53935', borderWidth: 1,
                        borderRadius: 10,
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - Download',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });


        const canvasStatusrede = document.getElementById('statusRedeChart');
        const existingStatusrede = Chart.getChart(canvasStatusrede);
        if (existingStatusrede) {
            existingStatusrede.destroy();
        }

        chartMBEnviados = new Chart(canvasStatusrede, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'Rede',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });

        const {
            contUpload,
            contUploadCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        ctxrede2 = document.getElementById('RedeChart2').getContext('2d');
        redeChart2 = new Chart(ctxrede2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contUpload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contUploadCritico,
                        backgroundColor: '#E53935', borderWidth: 1,
                        borderRadius: 10,
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - Upload',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });

        const canvasStatusrede2 = document.getElementById('statusRedeChart2');
        const existingStatusrede2 = Chart.getChart(canvasStatusrede2);
        if (existingStatusrede2) {
            existingStatusrede2.destroy();
        }

        chartMBRecebidos = new Chart(canvasStatusrede2, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'Rede',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });
    }

    if (periodo === "4") {

        const {
            contCPU,
            contCPUCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        const ctxCpu = document.getElementById('CpuChart').getContext('2d');
        cpuChart = new Chart(ctxCpu, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contCPU,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contCPUCritico,
                        backgroundColor: '#E53935', borderWidth: 1,
                        borderRadius: 10,
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - CPU',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });


        const canvasStatus = document.getElementById('statusChart');
        const existingStatus = Chart.getChart(canvasStatus);
        if (existingStatus) {
            existingStatus.destroy();
        }
        chartCPU = new Chart(canvasStatus, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'CPU',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });

        const {
            contRAM,
            contRAMCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        const ctxram = document.getElementById('RamChart').getContext('2d');

        ramChart = new Chart(ctxram, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contRAM,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contRAMCritico,
                        backgroundColor: '#E53935', borderWidth: 1,
                        borderRadius: 10,
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - RAM',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });

        const canvasStatusram = document.getElementById('statusRamChart');
        const existingStatusram = Chart.getChart(canvasStatusram);
        if (existingStatusram) {
            existingStatusram.destroy();
        }
        chartRAM = new Chart(canvasStatusram, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'Ram',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });

        const {
            contDisco,
            contDiscoCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        const ctxdisco = document.getElementById('DiscoChart').getContext('2d');

        discoChart = new Chart(ctxdisco, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contDisco,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contDiscoCritico,
                        backgroundColor: '#E53935', borderWidth: 1,
                        borderRadius: 10,
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - Disco',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });


        const canvasStatusdisco = document.getElementById('statusDiscoChart');
        const existingStatusdisco = Chart.getChart(canvasStatusdisco);
        if (existingStatusdisco) {
            existingStatusdisco.destroy();
        }

        chartDisco = new Chart(canvasStatusdisco, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'Disco',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });

        const {
            contDownload,
            contDownloadCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        const ctxrede = document.getElementById('RedeChart').getContext('2d');

        redeChart = new Chart(ctxrede, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contDownload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contDownloadCritico,
                        backgroundColor: '#E53935', borderWidth: 1,
                        borderRadius: 10,
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - Download',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });


        const canvasStatusrede = document.getElementById('statusRedeChart');
        const existingStatusrede = Chart.getChart(canvasStatusrede);
        if (existingStatusrede) {
            existingStatusrede.destroy();
        }

        chartMBEnviados = new Chart(canvasStatusrede, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'Rede',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        });

        const {
            contUpload,
            contUploadCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        ctxrede2 = document.getElementById('RedeChart2').getContext('2d');
        redeChart2 = new Chart(ctxrede2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: contUpload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: contUploadCritico,
                        backgroundColor: '#E53935', borderWidth: 1,
                        borderRadius: 10,
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Quantidade de Alertas - Upload',
                        color: 'black',
                        font: { size: 28 }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: 'black' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { color: 'black' }
                    }
                }
            }
        });

        const canvasStatusrede2 = document.getElementById('statusRedeChart2');
        const existingStatusrede2 = Chart.getChart(canvasStatusrede2);
        if (existingStatusrede2) {
            existingStatusrede2.destroy();
        }
        chartMBRecebidos = new Chart(canvasStatusrede2, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'Rede',
                    data: [0, 100],
                    backgroundColor: ['rgb(255,44,44)', "#e1e1e1ff"],
                    hoverOffset: 4,
                    borderWidth: 0,
                }]
            },
            options: {
                maintainAspectRatio: false,
                circumference: 180,
                cutout: '80%',
                rotation: 270,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [{
                id: 'center-text',
                beforeDraw: function (chart) {
                    const { ctx, chartArea: { width, height } } = chart;
                    const valor = Number(chart.data.datasets[0].data[0]).toFixed(0);
                    ctx.save();

                    ctx.font = 'bold 30px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(`${valor}%`, width / 2, height / 2 + 10);

                    ctx.font = 'bold 22px Arial';
                    ctx.fillStyle = '#000';
                    ctx.fillText('Em uso', width / 2, height / 2 + 60);

                    ctx.restore();
                }
            }]
        })
    }

}
window.onload = function () {
    carregarDados().then(() => {
        const Periodo = document.getElementById('periodo');
        Periodo.addEventListener('change', () => atualizarGraficoPorPeriodo(Periodo.value));
        atualizarGraficoPorPeriodo(Periodo.value);
    });
    setInterval(buscarDados, 2000)
    buscarDados();
    configurarRedirecionamentoDosCards();
};

function configurarRedirecionamentoDosCards() {
    const mapa = {
        cardCPU: "CpuChart",
        cardRAM: "RamChart",
        cardDisco: "DiscoChart",
        cardDownload: "RedeChart",
        cardUpload: "RedeChart2"
    };

    Object.keys(mapa).forEach(cardID => {
        const card = document.getElementById(cardID);
        const graficoID = mapa[cardID];

        if (card) {
            card.style.cursor = "pointer"; // adiciona cursor clicável
            card.addEventListener("click", () => {
                const destino = document.getElementById(graficoID);
                if (destino) {
                    destino.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            });
        }
    });
}   
