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
// let dadosPorPeriodo = {
//     '1': [],  // 1 hora
//     '2': [],  // 1 dia
//     '3': [],  // 3 dias
//     '4': []   // 7 dias
// };

let estatisticasAlertas = null;

// Converte datetime para timestamp
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
        //         data: qtdAlertasCPU,
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

        console.log('CPU ultimos5 por bloco:', qtdAlertasCPU);

        ctxCpu = document.getElementById('CpuChart').getContext('2d');
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

        const qtdAlertasRAM = contarAlertasPorPeriodo(dataFiltro, "ram_status");
        const qtdAlertasRAMcritico = contarAlertasPorPeriodo(dataFiltro, "ram_status_critico");

        const ctxram = document.getElementById('RamChart').getContext('2d');

        ramChart = new Chart(ctxram, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: qtdAlertasRAM,
                        backgroundColor: '#F4B000',
                        stack: 'alerts',
                        borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: qtdAlertasRAMcritico,
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

        const qtdAlertasDisco = contarAlertasPorPeriodo(dataFiltro, "disco_status");
        const qtdAlertasDiscocritico = contarAlertasPorPeriodo(dataFiltro, "disco_status_critico");

        const ctxdisco = document.getElementById('DiscoChart').getContext('2d');

        discoChart = new Chart(ctxdisco, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: qtdAlertasDisco,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: qtdAlertasDiscocritico,
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

        const ctxrede = document.getElementById('RedeChart').getContext('2d');

        redeChart = new Chart(ctxrede, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: qtdAlertasDownload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: qtdAlertasDownloadcritico,
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

        const qtdAlertasUpload = contarAlertasPorPeriodo(dataFiltro, "mb_enviados_status");
        const qtdAlertasUploadcritico = contarAlertasPorPeriodo(dataFiltro, "mb_enviados_status_critico");

        ctxrede2 = document.getElementById('RedeChart2').getContext('2d');
        redeChart2 = new Chart(ctxrede2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: qtdAlertasUpload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: qtdAlertasUploadcritico,
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


        var contador = 0;
        for (i = 0; i <= qtdAlertasCPU.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= qtdAlertasRAM.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= qtdAlertasDisco.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= qtdAlertasDownload.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }
        for (i = 0; i <= qtdAlertasUpload.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }


    }

    else if (periodo === "2") {

        const qtdAlertasCPU = contarAlertasPorPeriodo(dataFiltro, "cpu_status");
        const qtdAlertasCPUcritico = contarAlertasPorPeriodo(dataFiltro, "cpu_status_critico");

        // alertaCPU = qtdAlertasCPU
        // alertaCriticoCPU = qtdAlertasCPUcritico


        // penqtdAlertasCPU = qtdAlertasCPUcritico
        // penqtdAlertasCPUCritico = qtdAlertasCPUcritico

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

        const ctxram = document.getElementById('RamChart').getContext('2d');

        ramChart = new Chart(ctxram, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: qtdAlertasRAM,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: qtdAlertasRAMcritico,
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

        const ctxdisco = document.getElementById('DiscoChart').getContext('2d');

        discoChart = new Chart(ctxdisco, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: qtdAlertasDisco,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: qtdAlertasDiscocritico,
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


        const ctxrede = document.getElementById('RedeChart').getContext('2d');

        redeChart = new Chart(ctxrede, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: qtdAlertasDownload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: qtdAlertasDownloadcritico,
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

        ctxrede2 = document.getElementById('RedeChart2').getContext('2d');
        redeChart2 = new Chart(ctxrede2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: qtdAlertasUpload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: qtdAlertasUploadcritico,
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


        var contador = 0;
        for (i = 0; i <= qtdAlertasCPU.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= qtdAlertasRAM.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= qtdAlertasDisco.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= qtdAlertasDownload.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }
        for (i = 0; i <= qtdAlertasUpload.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }




    }

    if (periodo === "3") {

        const qtdAlertasCPU = contarAlertasPorPeriodo(dataFiltro, "cpu_status");
        const qtdAlertasCPUcritico = contarAlertasPorPeriodo(dataFiltro, "cpu_status_critico");


        alertaCPU = qtdAlertasCPU
        alertaCriticoCPU = qtdAlertasCPUcritico

        const ctxCpu = document.getElementById('CpuChart').getContext('2d');
        cpuChart = new Chart(ctxCpu, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: qtdAlertasCPUcritico,
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


        const ctxram = document.getElementById('RamChart').getContext('2d');

        ramChart = new Chart(ctxram, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: qtdAlertasRAM,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: qtdAlertasRAMcritico,
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

        const ctxdisco = document.getElementById('DiscoChart').getContext('2d');

        discoChart = new Chart(ctxdisco, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: qtdAlertasDisco,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: qtdAlertasDiscocritico,
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

        const ctxrede = document.getElementById('RedeChart').getContext('2d');

        redeChart = new Chart(ctxrede, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: qtdAlertasDownload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: qtdAlertasDownloadcritico,
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

        ctxrede2 = document.getElementById('RedeChart2').getContext('2d');
        redeChart2 = new Chart(ctxrede2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: qtdAlertasUpload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: qtdAlertasUploadcritico,
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


        var contador = 0;
        for (i = 0; i <= qtdAlertasCPUcritico.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= qtdAlertasRAM.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= qtdAlertasDisco.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= qtdAlertasDiscocritico.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }
        for (i = 0; i <= qtdAlertasUpload.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

    }

    if (periodo === "4") {


        const qtdAlertasCPU = contarAlertasPorPeriodo(dataFiltro, "cpu_status");
        const qtdAlertasCPUcritico = contarAlertasPorPeriodo(dataFiltro, "cpu_status_critico");

        alertaCPU = qtdAlertasCPU
        alertaCriticoCPU = qtdAlertasCPUcritico


        console.log('cpuAlertasPorBloco:', qtdAlertasCPU)

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

        alertaRAM = qtdAlertasRAM
        alertaCriticoRAM = qtdAlertasRAMcritico

        const ctxram = document.getElementById('RamChart').getContext('2d');

        ramChart = new Chart(ctxram, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: qtdAlertasRAM,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: qtdAlertasRAMcritico,
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

        alertaDisco = qtdAlertasDisco
        alertaCriticoDisco = qtdAlertasDiscocritico

        const ctxdisco = document.getElementById('DiscoChart').getContext('2d');

        discoChart = new Chart(ctxdisco, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: qtdAlertasDisco,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: qtdAlertasDiscocritico,
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

        alertaDownload = qtdAlertasDownload
        alertaCriticoDownload = qtdAlertasDownloadcritico

        const ctxrede = document.getElementById('RedeChart').getContext('2d');

        redeChart = new Chart(ctxrede, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: qtdAlertasDownload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: qtdAlertasDownloadcritico,
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

        alertaUpload = qtdAlertasUpload
        alertaCriticoUpload = qtdAlertasUploadcritico

        ctxrede2 = document.getElementById('RedeChart2').getContext('2d');
        redeChart2 = new Chart(ctxrede2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: qtdAlertasUpload,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: qtdAlertasUploadcritico,
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


        var contador = 0;
        for (i = 0; i <= qtdAlertasCPU.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= qtdAlertasRAM.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= qtdAlertasDisco.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }

        for (i = 0; i <= qtdAlertasDownload.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }
        for (i = 0; i <= qtdAlertasUpload.length; i++) {
            if (i != null || i != 0) {
                contador += 1
            }
        }


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
