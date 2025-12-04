const usersDiv = document.querySelector('.users');
const fkempresa = Number(sessionStorage.getItem('id'));
const servidor = JSON.parse(sessionStorage.getItem('servidorSelecionado'));

console.log('SERVIDOR COMPLETO:', servidor);
console.log('MAC:', servidor?.mac);
console.log('TODOS OS CAMPOS:', Object.keys(servidor || {}));

console.log({
    alerta_numero_critico: document.getElementById('alerta_numero_critico'),
    critico_CPU: document.getElementById('critico_CPU'),
    critico_RAM: document.getElementById('critico_RAM'),
    critico_Disco: document.getElementById('critico_Disco')
});

let cpuChart = null;
let ramChart = null;
let discoChart = null;
let redeChart = null;
let redeChart2 = null;
let reqChart = null;
let chartCPU = null;
let chartRAM = null;
let chartDisco = null;
let chartMBEnviados = null;
let chartMBRecebidos = null;

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

// Variáveis globais
let data = [];
let jsonSeparados = {
    total: [],
    ultimos5: [],
    primeiros5: [],
    penultimos5: [],
    posteriores5primeiros: []
};
// let dadosPorPeriodo = {
//     '1': [],  // 1 hora
//     '2': [],  // 1 dia
//     '3': [],  // 3 dias
//     '4': []   // 7 dias
// };

let estatisticasAlertas = null;

// Converte datetime "YYYY-MM-DD HH:mm:ss" p/ timestamp
function paraTimestamp(dateString) {
    return new Date(dateString.replace(" ", "T")).getTime();
}

function carregarDados() {
    return fetch('/s3/downloadJSON')
        .then(response => response.json())
        .then(response => {

            data = response.data.flat();
            console.log("TOTAL CARREGADO:", data.length);

            // 🔥 AGORA DIVIDE OS PERÍODOS DE VERDADE
            separarPorPeriodo(data);

            calcularAlertas(data);
        })
        .catch(err => console.error('ERRO S3:', err));
}

function calcularAlertas(dataFiltro = data) {
    console.log('CALCULANDO alertas com', dataFiltro.length, 'linhas brutas');

    if (servidor) {
        const mac = servidor.macaddress;
        const servidorData = dataFiltro.filter(row => row.macaddress === mac);

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
        alertaDownload = servidorData.filter(row => row.mb_enviados_status === "NORMAL").length;
        alertaUpload = servidorData.filter(row => row.mb_recebidos_status === "NORMAL").length;

        alertaCriticoCPU = servidorData.filter(row => row.cpu_status_critico === "CRITICO").length;
        alertaCriticoRAM = servidorData.filter(row => row.ram_status_critico === "CRITICO").length;
        alertaCriticoDisco = servidorData.filter(row => row.disco_status_critico === "CRITICO").length;
        alertaCriticoDownload = servidorData.filter(row => row.mb_enviados_status_critico === "CRITICO").length;
        alertaCriticoUpload = servidorData.filter(row => row.mb_recebidos_status_critico === "CRITICO").length;

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
        if (!row.datetime) return;
        const ts = new Date(row.datetime.replace(' ', 'T')).getTime();
        const diffHoras = (agora - ts) / (1000 * 60 * 60);

        if (i < 10) {
            console.log('AMOSTRA', i, row.datetime, '→ diffHoras =', diffHoras.toFixed(1));
        }

        if (diffHoras <= 1) dadosPorPeriodo[1].push(row);
        else if (diffHoras <= 24) dadosPorPeriodo[2].push(row);
        else if (diffHoras <= 72) dadosPorPeriodo[3].push(row);
        else if (diffHoras <= 168) dadosPorPeriodo[4].push(row);
    });

    console.log('PERÍODOS CORRETOS:', {
        '1H': dadosPorPeriodo[1].length,
        '1D': dadosPorPeriodo[2].length,
        '3D': dadosPorPeriodo[3].length,
        '7D': dadosPorPeriodo[4].length
    });
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
    fetch(`/metrica/obterUltimaPorMAC/${servidor.macaddress}`, { method: 'GET' })
        .then(resultado => resultado.json())
        .then(data => {
            atualizarCPU(data.cpu);
            atualizarRAM(data.ram);
            atualizarDisco(data.disco);
            atualizarMBEnviados(data.mbEnviados);
            atualizarMBRecebidos(data.mbRecebidos);
            atualizarBootTime(data.tempoBoot);
        })
        .catch(() => console.log('rode o python'));

    const id_servidor = JSON.parse(sessionStorage.getItem('servidorSelecionado')).id_servidor;
    fetch("/parametro/obterParametro/" + id_servidor, { method: 'GET' })
        .then(resultado => resultado.json())
        .then(data => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].nome == "CPU") {
                    document.getElementById('lim_padrao_cpu').innerHTML = data[i].alerta_normal + "%";
                    document.getElementById('lim_critico_cpu').innerHTML = data[i].alerta_critico + "%";
                } else if (data[i].nome == "RAM") {
                    document.getElementById('lim_padrao_ram').innerHTML = data[i].alerta_normal + "%";
                    document.getElementById('lim_critico_ram').innerHTML = data[i].alerta_critico + "%";
                } else if (data[i].nome == "Mb Enviados - REDE") {
                    document.getElementById('lim_padrao_disco').innerHTML = data[i].alerta_normal + "%";
                    document.getElementById('lim_critico_disco').innerHTML = data[i].alerta_critico + "%";
                } else if (data[i].nome == "Mb Recebidos - REDE") {
                    document.getElementById('lim_padrao_upload').innerHTML = data[i].alerta_normal + "%";
                    document.getElementById('lim_critico_upload').innerHTML = data[i].alerta_critico + "%";
                } else {
                    document.getElementById('lim_padrao_download').innerHTML = data[i].alerta_normal + "%";
                    document.getElementById('lim_critico_download').innerHTML = data[i].alerta_critico + "%";
                }
            }
        });
}

function atualizarCPU(valorCPU) {
    if (chartCPU) {
        chartCPU.data.datasets[0].data = [valorCPU, 100 - valorCPU];
        chartCPU.update();
    }
}

function atualizarRAM(valorRAM) {
    if (chartRAM) {
        chartRAM.data.datasets[0].data = [valorRAM, 100 - valorRAM];
        chartRAM.update();
    }
}

function atualizarDisco(valorDisco) {
    if (chartDisco) {
        chartDisco.data.datasets[0].data = [valorDisco, 100 - valorDisco];
        chartDisco.update();
    }
}

function atualizarMBRecebidos(valorMbRecebidos) {
    if (chartMBRecebidos) {
        chartMBRecebidos.data.datasets[0].data = [valorMbRecebidos, 100 - valorMbRecebidos];
        chartMBRecebidos.update();
    }
}

function atualizarMBEnviados(valorMbEnviados) {
    if (chartMBEnviados) {
        chartMBEnviados.data.datasets[0].data = [valorMbEnviados, 100 - valorMbEnviados];
        chartMBEnviados.update();
    }
}

function atualizarBootTime(bootTime) {
    const boottime = document.getElementById('boottime');
    boottime.innerHTML = formatarDiferenca(bootTime);
}



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

function atualizarGraficoPorPeriodo(periodo) {

    // const dadosFiltrados = dadosPorPeriodo[periodo];

    if (cpuChart) cpuChart.destroy();
    if (ramChart) ramChart.destroy();
    if (discoChart) discoChart.destroy();
    if (redeChart) redeChart.destroy();
    if (redeChart2) redeChart2.destroy();
    if (reqChart) reqChart.destroy();
    if (chartMBEnviados) chartMBEnviados.destroy();
    if (chartMBRecebidos) chartMBRecebidos.destroy();
    if (chartCPU) chartCPU.destroy();
    if (chartRAM) chartRAM.destroy();
    if (chartDisco) chartDisco.destroy();

    // Dados por período
    let dataFiltro = dadosPorPeriodo[periodo] ?? data;

    console.log(`PERÍODO ${periodo} → ${dataFiltro.length} linhas`);
    calcularAlertas(dataFiltro);

    if (periodo == 1) {
        labels = ['20:00', '20:15', '20:30', '20:45', '21:00;']
    } else if (periodo == 2) {
        labels = ['04:50', '09:40', '14:30', '19:20', '00:00']
    } else if (periodo == 3) {
        labels = ['sexta', 'sabado', 'domingo']
    } else if (periodo == 4) {
        labels = ['sexta', 'sabado', 'domingo', 'segunda', 'terça', 'quarta', 'quinta',]
    }


    if (periodo === "1") {


        //         const data = {
        //   labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
        //   datasets: [
        //     {
        //       label: 'Quantidade Alertas',
        //       data: alertaCPU,                     
        //       backgroundColor: 'rgba(255, 206, 86, 0.8)',
        //       borderColor: 'rgba(255, 206, 86, 1)',
        //       borderWidth: 1,
        //     },
        //     {
        //       label: 'Quantidade Críticos',
        //       data: alertaCriticoCPU,                     
        //       backgroundColor: 'rgba(255, 99, 132, 0.8)', 
        //       borderColor: 'rgba(255, 99, 132, 1)',
        //       borderWidth: 1,
        //     }
        //   ]
        // };

        // const data = {
        //   labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
        //   datasets: [
        //     {
        //       label: 'Alertas padrão',
        //       data: [1, 0, 2, 3, 1, 2],   // qtd padrão por hora
        //       backgroundColor: '#F4B000', // amarelo
        //       stack: 'alerts'
        //     },
        //     {
        //       label: 'Alertas críticos',
        //       data: [0, 3, 0, 0, 2, 3],   // qtd críticos por hora
        //       backgroundColor: '#E53935', // vermelho
        //       stack: 'alerts'
        //     }
        //   ]
        // };

        // new Chart(ctx, {
        //   type: 'bar',
        //   data,
        //   options: {
        //     scales: {
        //       x: { stacked: true },
        //       y: { stacked: true }
        //     }
        //   }
        // });

        //         data: {
        //     labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
        //     datasets: [{
        //         label: 'CPU',
        //         data: ultimos5CPU,
        //         backgroundColor: ['rgba(29, 173, 0, 1)',
        //             'rgb(242, 183, 48)',
        //             'rgba(29, 173, 0, 1)',
        //             'rgba(29, 173, 0, 1)',
        //             'rgba(29, 173, 0, 1)',
        //             'rgba(233, 0, 0, 1)',
        //         ],
        //         borderWidth: 1,
        //         borderRadius: 12,
        //     }]
        // },


        const qtdAlertasCPU = contarAlertasPorPeriodo(dataFiltro, "cpu_status");
        const qtdAlertasCPUcritico = contarAlertasPorPeriodo(dataFiltro, "cpu_status_critico");

        const ultimos5CPU = qtdAlertasCPU;

        const ultimos5CPUCritico = qtdAlertasCPUcritico

        console.log('jsonSeparados.ultimos5:', jsonSeparados.ultimos5);
        console.log('tipo:', Array.isArray(jsonSeparados.ultimos5));
        console.log('length:', jsonSeparados.ultimos5?.length);

        console.log('CPU ultimos5 por bloco:', ultimos5CPU);

        ctxCpu = document.getElementById('CpuChart').getContext('2d');
        cpuChart = new Chart(ctxCpu, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: ultimos5CPU,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: ultimos5CPUCritico,
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

        const ultimos5RAM = jsonSeparados.ultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.ram_status && row.ram_status == "NORMAL").length;
            console.log(`bloco ${idx} -> RAM alertas:`, qtd);
            return qtd;
        });

        const ultimos5RAMCritico = jsonSeparados.ultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.ram_status_critico && row.ram_status_critico == "CRITICO").length;
            console.log(`bloco ${idx} -> RAM alertas:`, qtd);
            return qtd;
        });

        const ctxram = document.getElementById('RamChart').getContext('2d');

        ramChart = new Chart(ctxram, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: ultimos5RAM,
                        backgroundColor: '#F4B000',
                        stack: 'alerts',
                        borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: ultimos5RAMCritico,
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

        const ultimos5Disco = jsonSeparados.ultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.disco_status && row.disco_status == "NORMAL").length;
            console.log(`bloco ${idx} -> RAM alertas:`, qtd);
            return qtd;
        });

        const ultimos5DiscoCritico = jsonSeparados.ultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.disco_status_critico && row.disco_status_critico == "CRITICO").length;
            console.log(`bloco ${idx} -> Disco alertas:`, qtd);
            return qtd;
        });

        const ctxdisco = document.getElementById('DiscoChart').getContext('2d');

        discoChart = new Chart(ctxdisco, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: ultimos5Disco,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: ultimos5DiscoCritico,
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

        const ultimos5Download = jsonSeparados.ultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.mb_recebidos_status && row.mb_recebidos_status == "NORMAL").length;
            console.log(`bloco ${idx} -> Donwload alertas:`, qtd);
            return qtd;
        });


        const ultimos5DownloadCritico = jsonSeparados.ultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.mb_recebidos_status_critico && row.mb_recebidos_status_critico == "NORMAL").length;
            console.log(`bloco ${idx} -> Donwload alertas:`, qtd);
            return qtd;
        });

        const ctxrede = document.getElementById('RedeChart').getContext('2d');

        redeChart = new Chart(ctxrede, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: ultimos5Download,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: ultimos5DownloadCritico,
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

        const ultimos5Upload = jsonSeparados.ultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.mb_enviados_status && row.mb_enviados_status == "NORMAL").length;
            console.log(`bloco ${idx} -> Upload alertas:`, qtd);
            return qtd;
        });
        const ultimos5UploadCritico = jsonSeparados.ultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.mb_enviados_status_critico && row.mb_enviados_status_critico == "CRITICO").length;
            console.log(`bloco ${idx} -> Upload alertas:`, qtd);
            return qtd;
        });

        ctxrede2 = document.getElementById('RedeChart2').getContext('2d');
        redeChart2 = new Chart(ctxrede2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: ultimos5Upload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: ultimos5UploadCritico,
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


        ctxReq = document.getElementById('reqChart').getContext('2d');
        reqChart = new Chart(ctxReq, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'CPU',
                    data: [30, 80, 50, 55, 45, 100],
                    backgroundColor: ['rgba(29, 173, 0, 1)',
                        'rgb(242, 183, 48)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(233, 0, 0, 1)',
                    ],
                    borderWidth: 1,
                    borderRadius: 12,
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        color: 'black',
                        text: 'Quantidade de requisições',
                        font: {
                            size: 28
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'black'
                        }
                    },
                }
            }
        });

        function somarArray(arr) {
            return arr.reduce((total, n) => total + Number(n), 0);
        }

        // let totalCPU5 = somarArray(ultimos5CPU);
        // let totalRAM5 = somarArray(ultimos5RAM);
        // let totalDisco5 = somarArray(ultimos5Disco);
        // let totalDownload5 = somarArray(ultimos5Download);
        // let totalUpload5 = somarArray(ultimos5Upload);

        // somaAlertas = (totalCPU5 + totalRAM5 + totalDisco5 + totalDownload5 + totalUpload5)

        // let totalCPU5Critico = somarArray(ultimos5CPUCritico)
        // let totalRAM5Critico = somarArray(ultimos5RAMCritico)
        // let totalDisco5Critico = somarArray(ultimos5DiscoCritico)
        // let totalDownload5Critico = somarArray(ultimos5DownloadCritico)
        // let totalUpload5Critico = somarArray(ultimos5UploadCritico);

        // somaAlertaCriticos = (totalCPU5Critico + totalRAM5Critico + totalDisco5Critico + totalDownload5Critico + totalUpload5Critico)

        var contador = 0;
        for (i = 0; i <= ultimos5CPU.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= ultimos5RAM.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= ultimos5Disco.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= ultimos5Download.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }
        for (i = 0; i <= ultimos5Upload.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }



        // document.getElementById('critico_CPU').textContent = totalCPU5Critico;
        // document.getElementById('padrao_CPU').textContent = totalCPU5;
        // document.getElementById('critico_RAM').textContent = totalRAM5Critico;
        // document.getElementById('padrao_RAM').textContent = totalRAM5;
        // document.getElementById('critico_Disco').textContent = totalDisco5Critico;
        // document.getElementById('padrao_Disco').textContent = totalDisco5;
        // document.getElementById('critico_Download').textContent = totalDownload5Critico;
        // document.getElementById('padrao_Download').textContent = totalDownload5;
        // document.getElementById('critico_Upload').textContent = totalUpload5Critico;
        // document.getElementById('padrao_Upload').textContent = totalUpload5;

        // document.getElementById('alerta_numero_padrao').textContent = somaAlertas;
        // document.getElementById('alerta_numero_critico').textContent = somaAlertaCriticos;
    }

    else if (periodo === "2") {

        const qtdAlertasCPU = contarAlertasPorPeriodo(dataFiltro, "cpu_status");
        const qtdAlertasCPUcritico = contarAlertasPorPeriodo(dataFiltro, "cpu_status_critico");

        totalCPU5 = qtdAlertasCPU
        totalCPU5Critico = qtdAlertasCPUcritico


        alertaCPU = totalCPU5
        alertaCriticoCPU = totalCPU5Critico


        penultimos5CPU = qtdAlertasCPUcritico
        penultimos5CPUCritico = qtdAlertasCPUcritico

        const ctxCpu = document.getElementById('CpuChart').getContext('2d');
        cpuChart = new Chart(ctxCpu, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: qtdAlertasCPU,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: qtdAlertasCPUcritico,
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

        const qtdAlertasRAM = contarAlertasPorPeriodo(dataFiltro, "ram_status");
        const qtdAlertasRAMcritico = contarAlertasPorPeriodo(dataFiltro, "ram_status_critico");

        totalRAM5 = qtdAlertasRAM
        totalRAM5Critico = qtdAlertasRAMcritico


        penultimos5RAM = qtdAlertasRAM
        penultimos5RAMCritico = qtdAlertasRAMcritico

        const ctxram = document.getElementById('RamChart').getContext('2d');

        ramChart = new Chart(ctxram, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: penultimos5RAM,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: penultimos5RAMCritico,
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

        const qtdAlertasDisco = contarAlertasPorPeriodo(dataFiltro, "disco_status");
        const qtdAlertasDiscocritico = contarAlertasPorPeriodo(dataFiltro, "disco_status_critico");

        totalDisco5 = qtdAlertasDisco
        totalDisco5Critico = qtdAlertasDiscocritico


        penultimos5Disco = qtdAlertasDisco
        penultimos5DiscoCritico = qtdAlertasDiscocritico

        const ctxdisco = document.getElementById('DiscoChart').getContext('2d');

        discoChart = new Chart(ctxdisco, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: penultimos5Disco,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: penultimos5DiscoCritico,
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

        const qtdAlertasDownload = contarAlertasPorPeriodo(dataFiltro, "mb_recebidos_status");
        const qtdAlertasDownloadcritico = contarAlertasPorPeriodo(dataFiltro, "mb_recebidos_status_critico");

        totalDownload5 = qtdAlertasDownload
        totalDownload5Critico = qtdAlertasDownloadcritico

        penultimos5Download = qtdAlertasDownload
        penultimos5DownloadCritico = qtdAlertasDownloadcritico

        const ctxrede = document.getElementById('RedeChart').getContext('2d');

        redeChart = new Chart(ctxrede, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: penultimos5Download,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: penultimos5DownloadCritico,
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

        const qtdAlertasUpload = contarAlertasPorPeriodo(dataFiltro, "mb_enviados_status");
        const qtdAlertasUploadcritico = contarAlertasPorPeriodo(dataFiltro, "mb_enviados_status_critico");

        penultimos5Upload = qtdAlertasUpload
        penultimos5UploadCritico = qtdAlertasUploadcritico

        totalUpload5 = qtdAlertasUpload
        totalUpload5Critico = qtdAlertasUploadcritico

        ctxrede2 = document.getElementById('RedeChart2').getContext('2d');
        redeChart2 = new Chart(ctxrede2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: penultimos5Upload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: penultimos5UploadCritico,
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

        ctxReq = document.getElementById('reqChart').getContext('2d');
        reqChart = new Chart(ctxReq, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'Requisições',
                    data: [50, 40, 70, 65, 75, 95],
                    backgroundColor: ['rgba(29, 173, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(233, 0, 0, 1)',
                    ],
                    borderWidth: 1,
                    borderRadius: 12,
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        color: 'black',
                        text: 'Quantidade de requisições',
                        font: {
                            size: 28
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'black'
                        }
                    },
                }
            }
        });


        // function somarArray(arr) {
        //     return arr.reduce((total, n) => total + Number(n), 0);
        // }

        // somaAlertas = alertaCPU + alertaRAM + alertaDisco + alertaDownload + alertaUpload;
        // somaAlertaCriticos = alertaCriticoCPU + alertaCriticoRAM + alertaCriticoDisco + alertaCriticoDownload + alertaCriticoUpload;

        // document.getElementById('alerta_numero_padrao').textContent = somaAlertas || 0;
        // document.getElementById('alerta_numero_critico').textContent = somaAlertaCriticos || 0;

        // document.getElementById('critico_CPU').textContent = alertaCriticoCPU || 0;
        // document.getElementById('padrao_CPU').textContent = alertaCPU || 0;
        // document.getElementById('critico_RAM').textContent = alertaCriticoRAM || 0;
        // document.getElementById('padrao_RAM').textContent = alertaRAM || 0;
        // document.getElementById('critico_Disco').textContent = alertaCriticoDisco || 0;
        // document.getElementById('padrao_Disco').textContent = alertaDisco || 0;
        // document.getElementById('critico_Download').textContent = alertaCriticoDownload || 0;
        // document.getElementById('padrao_Download').textContent = alertaDownload || 0;
        // document.getElementById('critico_Upload').textContent = alertaCriticoUpload || 0;
        // document.getElementById('padrao_Upload').textContent = alertaUpload || 0;

        var contador = 0;
        for (i = 0; i <= penultimos5CPU.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= penultimos5RAM.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= penultimos5Disco.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= penultimos5Download.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }
        for (i = 0; i <= penultimos5Upload.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }



        // document.getElementById('critico_CPU').textContent = alertaCriticoCPU;
        // document.getElementById('padrao_CPU').textContent = alertaCPU;
        // document.getElementById('critico_RAM').textContent = totalRAM5Critico;
        // document.getElementById('padrao_RAM').textContent = totalRAM5;
        // document.getElementById('critico_Disco').textContent = totalDisco5Critico;
        // document.getElementById('padrao_Disco').textContent = totalDisco5;
        // document.getElementById('critico_Download').textContent = totalDownload5Critico;
        // document.getElementById('padrao_Download').textContent = totalDownload5;
        // document.getElementById('critico_Upload').textContent = totalUpload5Critico;
        // document.getElementById('padrao_Upload').textContent = totalUpload5;

        // document.getElementById('alerta_numero_padrao').textContent = somaAlertas;
        // document.getElementById('alerta_numero_critico').textContent = somaAlertaCriticos;

    }

    if (periodo === "3") {

        const qtdAlertasCPU = contarAlertasPorPeriodo(dataFiltro, "cpu_status");
        const qtdAlertasCPUcritico = contarAlertasPorPeriodo(dataFiltro, "cpu_status_critico");

        totalCPU5 = qtdAlertasCPU
        totalCPU5Critico = qtdAlertasCPUcritico


        alertaCPU = totalCPU5
        alertaCriticoCPU = totalCPU5Critico


        posteriores5primeirosCPU = qtdAlertasCPUcritico
        posteriores5primeirosCPUCritico = qtdAlertasCPUcritico

        const ctxCpu = document.getElementById('CpuChart').getContext('2d');
        cpuChart = new Chart(ctxCpu, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: posteriores5primeirosCPU,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: posteriores5primeirosCPUCritico,
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

        const qtdAlertasRAM = contarAlertasPorPeriodo(dataFiltro, "ram_status");
        const qtdAlertasRAMcritico = contarAlertasPorPeriodo(dataFiltro, "ram_status_critico");

        totalRAM5 = qtdAlertasRAM
        totalRAM5Critico = qtdAlertasRAMcritico


        posteriores5primeirosRAM = qtdAlertasRAM
        posteriores5primeirosRAMCritico = qtdAlertasRAMcritico


        const ctxram = document.getElementById('RamChart').getContext('2d');

        ramChart = new Chart(ctxram, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: posteriores5primeirosRAM,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: posteriores5primeirosRAMCritico,
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

        const qtdAlertasDisco = contarAlertasPorPeriodo(dataFiltro, "disco_status");
        const qtdAlertasDiscocritico = contarAlertasPorPeriodo(dataFiltro, "disco_status_critico");

        totalDisco5 = qtdAlertasDisco
        totalDisco5Critico = qtdAlertasDiscocritico


        posteriores5primeirosDisco = qtdAlertasDisco
        posteriores5primeirosDiscoCritico = qtdAlertasDiscocritico


        const ctxdisco = document.getElementById('DiscoChart').getContext('2d');

        discoChart = new Chart(ctxdisco, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: posteriores5primeirosDisco,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: posteriores5primeirosDiscoCritico,
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


       const qtdAlertasDownload = contarAlertasPorPeriodo(dataFiltro, "mb_recebidos_status");
        const qtdAlertasDownloadcritico = contarAlertasPorPeriodo(dataFiltro, "mb_recebidos_status_critico");

        totalDownload5 = qtdAlertasDownload
        totalDownload5Critico = qtdAlertasDownloadcritico

        posteriores5primeirosDownload = qtdAlertasDownload
        posteriores5primeirosDownloadCritico = qtdAlertasDownloadcritico

        const ctxrede = document.getElementById('RedeChart').getContext('2d');

        redeChart = new Chart(ctxrede, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: posteriores5primeirosDownload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: posteriores5primeirosDownloadCritico,
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

        const qtdAlertasUpload = contarAlertasPorPeriodo(dataFiltro, "mb_enviados_status");
        const qtdAlertasUploadcritico = contarAlertasPorPeriodo(dataFiltro, "mb_enviados_status_critico");

        penultimos5Upload = qtdAlertasUpload
        penultimos5UploadCritico = qtdAlertasUploadcritico

        posteriores5primeirosUpload = qtdAlertasUpload
        posteriores5primeirosUploadCritico = qtdAlertasUploadcritico

        ctxrede2 = document.getElementById('RedeChart2').getContext('2d');
        redeChart2 = new Chart(ctxrede2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: posteriores5primeirosUpload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: posteriores5primeirosUploadCritico,
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

        ctxReq = document.getElementById('reqChart').getContext('2d');
        reqChart = new Chart(ctxReq, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'Requisições',
                    data: [85, 50, 30, 40, 65, 90],
                    backgroundColor: ['rgb(242, 183, 48)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(233, 0, 0, 1)',
                    ],
                    borderWidth: 1,
                    borderRadius: 12,
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        color: 'black',
                        text: 'Quantidade de requisições',
                        font: {
                            size: 28
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'black'
                        }
                    },
                }
            }
        });

        // function somarArray(arr) {
        //     return arr.reduce((total, n) => total + Number(n), 0);
        // }

        // let totalCPU5 = somarArray(posteriores5primeirosCPU);
        // let totalRAM5 = somarArray(posteriores5primeirosRAM);
        // let totalDisco5 = somarArray(posteriores5primeirosDisco);
        // let totalDownload5 = somarArray(posteriores5primeirosDownload);
        // let totalUpload5 = somarArray(posteriores5primeirosUpload);

        // somaAlertas = (totalCPU5 + totalRAM5 + totalDisco5 + totalDownload5 + totalUpload5)

        // let totalCPU5Critico = somarArray(posteriores5primeirosCPUCritico)
        // let totalRAM5Critico = somarArray(posteriores5primeirosRAMCritico)
        // let totalDisco5Critico = somarArray(posteriores5primeirosDiscoCritico)
        // let totalDownload5Critico = somarArray(posteriores5primeirosDownloadCritico)
        // let totalUpload5Critico = somarArray(posteriores5primeirosUploadCritico);

        // somaAlertaCriticos = (totalCPU5Critico + totalRAM5Critico + totalDisco5Critico + totalDownload5Critico + totalUpload5Critico)

        var contador = 0;
        for (i = 0; i <= posteriores5primeirosCPU.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= posteriores5primeirosRAM.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= posteriores5primeirosDisco.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= posteriores5primeirosDownload.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }
        for (i = 0; i <= posteriores5primeirosUpload.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        // document.getElementById('critico_CPU').textContent = totalCPU5Critico;
        // document.getElementById('padrao_CPU').textContent = totalCPU5;
        // document.getElementById('critico_RAM').textContent = totalRAM5Critico;
        // document.getElementById('padrao_RAM').textContent = totalRAM5;
        // document.getElementById('critico_Disco').textContent = totalDisco5Critico;
        // document.getElementById('padrao_Disco').textContent = totalDisco5;
        // document.getElementById('critico_Download').textContent = totalDownload5Critico;
        // document.getElementById('padrao_Download').textContent = totalDownload5;
        // document.getElementById('critico_Upload').textContent = totalUpload5Critico;
        // document.getElementById('padrao_Upload').textContent = totalUpload5;

        // document.getElementById('alerta_numero_padrao').textContent = somaAlertas;
        // document.getElementById('alerta_numero_critico').textContent = somaAlertaCriticos;

    }

    if (periodo === "4") {


        const qtdAlertasCPU = contarAlertasPorPeriodo(dataFiltro, "cpu_status");
        const qtdAlertasCPUcritico = contarAlertasPorPeriodo(dataFiltro, "cpu_status_critico");

        totalCPU5 = qtdAlertasCPU
        totalCPU5Critico = qtdAlertasCPUcritico


        alertaCPU = totalCPU5
        alertaCriticoCPU = totalCPU5Critico

        primeiros5CPU = qtdAlertasCPU
        primeiros5CPUCritico = qtdAlertasCPUcritico


        console.log('cpuAlertasPorBloco:', primeiros5CPU)

        const ctxCpu = document.getElementById('CpuChart').getContext('2d');
        cpuChart = new Chart(ctxCpu, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: primeiros5CPU,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: primeiros5CPUCritico,
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


        const qtdAlertasRAM = contarAlertasPorPeriodo(dataFiltro, "ram_status");
        const qtdAlertasRAMcritico = contarAlertasPorPeriodo(dataFiltro, "ram_status_critico");

        totalRAM5 = qtdAlertasRAM
        totalRAM5Critico = qtdAlertasRAMcritico


        alertaRAM = totalRAM5
        alertaCriticoRAM = totalRAM5Critico

        primeiros5RAM = qtdAlertasRAM
        primeiros5RAMCritico = qtdAlertasRAMcritico

        const ctxram = document.getElementById('RamChart').getContext('2d');

        ramChart = new Chart(ctxram, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: primeiros5RAM,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: primeiros5RAMCritico,
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

        const qtdAlertasDisco = contarAlertasPorPeriodo(dataFiltro, "disco_status");
        const qtdAlertasDiscocritico = contarAlertasPorPeriodo(dataFiltro, "disco_status_critico");

        totalDisco5 = qtdAlertasDisco
        totalDisco5Critico = qtdAlertasDiscocritico


        alertaDisco = totalDisco5
        alertaCriticoDisco = totalDisco5Critico

        primeiros5Disco = qtdAlertasDisco
        primeiros5DiscoCritico = qtdAlertasDiscocritico

        const ctxdisco = document.getElementById('DiscoChart').getContext('2d');

        discoChart = new Chart(ctxdisco, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: primeiros5Disco,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: primeiros5DiscoCritico,
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

        const qtdAlertasDownload = contarAlertasPorPeriodo(dataFiltro, "mb_recebidos_status");
        const qtdAlertasDownloadcritico = contarAlertasPorPeriodo(dataFiltro, "mb_recebidos_status_critico");

        totalDownload5 = qtdAlertasDownload
        totalDownload5Critico = qtdAlertasDownloadcritico


        alertaDownload = totalDownload5
        alertaCriticoDownload = totalDownload5Critico

        primeiros5Download = qtdAlertasDownload
        primeiros5DownloadCritico = qtdAlertasDownloadcritico

        const ctxrede = document.getElementById('RedeChart').getContext('2d');

        redeChart = new Chart(ctxrede, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: primeiros5Download,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: primeiros5DownloadCritico,
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

        const qtdAlertasUpload = contarAlertasPorPeriodo(dataFiltro, "mb_enviados_status");
        const qtdAlertasUploadcritico = contarAlertasPorPeriodo(dataFiltro, "mb_enviados_status_critico");

        totalUpload5 = qtdAlertasUpload
        totalUpload5Critico = qtdAlertasUploadcritico


        alertaUpload = totalUpload5
        alertaCriticoUpload = totalUpload5Critico

        primeiros5Upload = qtdAlertasUpload
        primeiros5UploadCritico = qtdAlertasUploadcritico

        ctxrede2 = document.getElementById('RedeChart2').getContext('2d');
        redeChart2 = new Chart(ctxrede2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: primeiros5Upload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: primeiros5UploadCritico,
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

        ctxReq = document.getElementById('reqChart').getContext('2d');
        reqChart = new Chart(ctxReq, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'Requisições',
                    data: [30, 80, 50, 55, 45, 100],
                    backgroundColor: ['rgba(29, 173, 0, 1)',
                        'rgb(242, 183, 48)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(233, 0, 0, 1)',
                    ],
                    borderWidth: 1,
                    borderRadius: 12,
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        color: 'black',
                        text: 'Quantidade de requisições',
                        font: {
                            size: 28
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'black'
                        }
                    },
                }
            }
        });

        // function somarArray(arr) {
        //     return arr.reduce((total, n) => total + Number(n), 0);
        // }

        // let totalCPU5 = somarArray(primeiros5CPU);
        // let totalRAM5 = somarArray(primeiros5RAM);
        // let totalDisco5 = somarArray(primeiros5Disco);
        // let totalDownload5 = somarArray(primeiros5Download);
        // let totalUpload5 = somarArray(primeiros5Upload);

        // somaAlertas = (totalCPU5 + totalRAM5 + totalDisco5 + totalDownload5 + totalUpload5)

        // let totalCPU5Critico = somarArray(primeiros5CPUCritico)
        // let totalRAM5Critico = somarArray(primeiros5RAMCritico)
        // let totalDisco5Critico = somarArray(primeiros5DiscoCritico)
        // let totalDownload5Critico = somarArray(primeiros5DownloadCritico)
        // let totalUpload5Critico = somarArray(primeiros5UploadCritico);

        // somaAlertaCriticos = (totalCPU5Critico + totalRAM5Critico + totalDisco5Critico + totalDownload5Critico + totalUpload5Critico)

        var contador = 0;
        for (i = 0; i <= primeiros5CPU.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= primeiros5RAM.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= primeiros5Disco.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= primeiros5Download.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }
        for (i = 0; i <= primeiros5Upload.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        // document.getElementById('critico_CPU').textContent = totalCPU5Critico;
        // document.getElementById('padrao_CPU').textContent = totalCPU5;
        // document.getElementById('critico_RAM').textContent = totalRAM5Critico;
        // document.getElementById('padrao_RAM').textContent = totalRAM5;
        // document.getElementById('critico_Disco').textContent = totalDisco5Critico;
        // document.getElementById('padrao_Disco').textContent = totalDisco5;
        // document.getElementById('critico_Download').textContent = totalDownload5Critico;
        // document.getElementById('padrao_Download').textContent = totalDownload5;
        // document.getElementById('critico_Upload').textContent = totalUpload5Critico;
        // document.getElementById('padrao_Upload').textContent = totalUpload5;

        // document.getElementById('alerta_numero_padrao').textContent = somaAlertas;
        // document.getElementById('alerta_numero_critico').textContent = somaAlertaCriticos;

    }

}
window.onload = function () {
    carregarDados().then(() => {
        const Periodo = document.getElementById('periodo');
        Periodo.addEventListener('change', () => atualizarGraficoPorPeriodo(Periodo.value));
        atualizarGraficoPorPeriodo(Periodo.value);
    });

    setInterval(buscarDados, 2000);
    buscarDados();
};
