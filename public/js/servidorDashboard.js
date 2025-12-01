const usersDiv = document.querySelector('.users');
const fkempresa = Number(sessionStorage.getItem('id'));
const servidor = JSON.parse(sessionStorage.getItem('servidorSelecionado'));

console.log('SERVIDOR COMPLETO:', servidor);
console.log('MAC:', servidor?.mac);
console.log('TODOS OS CAMPOS:', Object.keys(servidor || {}));

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
let estatisticasAlertas = null;

function carregarDados() {
    return fetch('/s3/downloadJSON')
        .then(response => response.json())
        .then(response => {
            const todosBlocos = response.data;

            // Separar períodos
            jsonSeparados.total = todosBlocos;
            jsonSeparados.ultimos5 = todosBlocos.slice(-5);
            jsonSeparados.primeiros5 = todosBlocos.slice(-10);
            jsonSeparados.penultimos5 = todosBlocos.slice(-15);
            jsonSeparados.posteriores5primeiros = todosBlocos.slice(-20);


            data = todosBlocos.slice(-20).flat();

            console.log('DADOS BRUTOS CARREGADOS:', data.length, 'linhas totais');
            calcularAlertas(data);
        })
        .catch(err => console.error('ERRO S3:', err));
}

function calcularAlertas(dataFiltro = data) {
    console.log('CALCULANDO alertas com', dataFiltro.length, 'linhas brutas');

    if (servidor) {
        const mac = servidor.macaddress;
        const servidorData = dataFiltro.filter(row => row.macaddress === mac);

        console.log('SERVIDOR DATA após filtro MAC:', servidorData.length, 'linhas');

        alertaCPU = data.filter(row => row.cpu_status === "NORMAL").length;
        alertaRAM = data.filter(row => row.ram_status === "NORMAL").length;
        alertaDisco = data.filter(row => row.disco_status === "NORMAL").length;
        alertaDownload = data.filter(row => row.mb_enviados_status === "NORMAL").length;
        alertaUpload = data.filter(row => row.mb_recebidos_status === "NORMAL").length;

        alertaCriticoCPU = data.filter(row => row.cpu_status_critico === "CRITICO").length;
        alertaCriticoRAM = data.filter(row => row.ram_status_critico === "CRITICO").length;
        alertaCriticoDisco = data.filter(row => row.disco_status_critico === "CRITICO").length;
        alertaCriticoDownload = data.filter(row => row.mb_enviados_status_critico === "CRITICO").length;
        alertaCriticoUpload = data.filter(row => row.mb_recebidos_status_critico === "CRITICO").length;

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
    return blocoDados.filter(row => row[metrica] && row[metrica] !== "NORMAL").length;
}

function atualizarGraficoPorPeriodo(periodo) {

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
    let dataFiltro;
    if (periodo === '1') dataFiltro = jsonSeparados.primeiros5.flat();
    else if (periodo === '2') dataFiltro = jsonSeparados.posteriores5primeiros.flat();
    else if (periodo === '3') dataFiltro = jsonSeparados.penultimos5.flat();
    else if (periodo === '4') dataFiltro = jsonSeparados.ultimos5.flat();
    else dataFiltro = data;

    console.log('PERÍODO', periodo, 'linhas brutas:', dataFiltro.length);
    calcularAlertas(dataFiltro);

        if(periodo == 1){
            labels = ['20:00', '20:15', '20:30', '20:45', '21:00;']
        } else if (periodo == 2){
            labels = ['04:50', '09:40', '14:30', '19:20', '00:00']
        } else if (periodo == 3){
            labels = [ 'sexta','sabado','domingo'] 
        } else if (periodo == 4){
             labels = ['sexta','sabado','domingo','segunda','terça','quarta', 'quinta',] 
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

        const ultimos5CPU = jsonSeparados.ultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.cpu_status && row.cpu_status == "NORMAL").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
            return qtd;
        });

        const ultimos5CPUCritico = jsonSeparados.ultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.cpu_status_critico && row.cpu_status_critico == "CRITICO").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
            return qtd;
        });

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

        // somaAlertas = ultimos5CPU + ultimos5RAM + ultimos5Disco + ultimos5Download + ultimos5Upload

        // document.getElementById('alerta_numero_padrao').textContent = somaAlertas;
        // document.getElementById('alerta_numero_critico').textContent = somaAlertaCriticos;
    }

    else if (periodo === "2") {

        const penultimos5CPU = jsonSeparados.penultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.cpu_status && row.cpu_status == "NORMAL").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
            return qtd;
        });

        const penultimos5CPUCritico = jsonSeparados.penultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.cpu_status_critico && row.cpu_status_critico == "CRITICO").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
            return qtd;
        });

        const ctxCpu = document.getElementById('CpuChart').getContext('2d');
        cpuChart = new Chart(ctxCpu, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alertas padrão',
                        data: penultimos5CPU,
                        backgroundColor: '#F4B000',
                        stack: 'alerts', borderWidth: 1,
                        borderRadius: 10,
                    },
                    {
                        label: 'Alertas críticos',
                        data: penultimos5CPUCritico,
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

        const penultimos5RAM = jsonSeparados.penultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.ram_status && row.ram_status == "NORMAL").length;
            console.log(`bloco ${idx} -> RAM alertas:`, qtd);
            return qtd;
        });
        const penultimos5RAMCritico = jsonSeparados.penultimos5.map((bloco, idx) => {
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

        const penultimos5Disco = jsonSeparados.penultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.disco_status && row.disco_status == "NORMAL").length;
            console.log(`bloco ${idx} -> RAM alertas:`, qtd);
            return qtd;
        });

        const penultimos5DiscoCritico = jsonSeparados.penultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.disco_status_critico && row.disco_status_critico == "CRITICO").length;
            console.log(`bloco ${idx} -> RAM alertas:`, qtd);
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

        const penultimos5Download = jsonSeparados.penultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.mb_enviados_status && row.mb_enviados_status == "NORMAL").length;
            console.log(`bloco ${idx} -> RAM alertas:`, qtd);
            return qtd;
        });

        const penultimos5DownloadCritico = jsonSeparados.penultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.mb_enviados_status_critico && row.mb_enviados_status_critico == "CRITICO").length;
            console.log(`bloco ${idx} -> RAM alertas:`, qtd);
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

        const penultimos5Upload = jsonSeparados.penultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.mb_recebidos_status && row.mb_recebidos_status == "NORMAL").length;
            console.log(`bloco ${idx} -> Upload alertas:`, qtd);
            return qtd;
        });

        const penultimos5UploadCritico = jsonSeparados.penultimos5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.mb_recebidos_status_critico && row.mb_recebidos_status_critico == "CRITICO").length;
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


    }

    if (periodo === "3") {

        const posteriores5primeirosCPU = jsonSeparados.posteriores5primeiros.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.cpu_status && row.cpu_status == "NORMAL").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
            return qtd;
        });


        const posteriores5primeirosCPUCritico = jsonSeparados.posteriores5primeiros.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.cpu_status_critico && row.cpu_status_critico == "CRITICO").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
            return qtd;
        });

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

        const posteriores5primeirosRAM = jsonSeparados.posteriores5primeiros.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.ram_status && row.ram_status == "NORMAL").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
            return qtd;
        });

        const posteriores5primeirosRAMCritico = jsonSeparados.posteriores5primeiros.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.ram_status_critico && row.ram_status_critico == "CRITICO").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
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

        const posteriores5primeirosDisco = jsonSeparados.posteriores5primeiros.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.disco_status && row.disco_status == "NORMAL").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
            return qtd;
        });

        const posteriores5primeirosDiscoCritico = jsonSeparados.posteriores5primeiros.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.disco_status_critico && row.disco_status_critico == "CRITICO").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
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


        const posteriores5primeirosDownload = jsonSeparados.posteriores5primeiros.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.mb_recebidos_status && row.mb_recebidos_status == "NORMAL").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
            return qtd;
        });

        const posteriores5primeirosDownloadCritico = jsonSeparados.posteriores5primeiros.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.mb_recebidos_status_critico && row.mb_recebidos_status_critico == "CRITICO").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
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

        const posteriores5primeirosUpload = jsonSeparados.posteriores5primeiros.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.mb_enviados_status && row.mb_enviados_status == "NORMAL").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
            return qtd;
        });

        const posteriores5primeirosUploadCritico = jsonSeparados.posteriores5primeiros.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.mb_enviados_status_critico && row.mb_enviados_status_critico == "CRITICO").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
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


    }

    if (periodo === "4") {


        const primeiros5CPU = jsonSeparados.primeiros5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.cpu_status && row.cpu_status == "NORMAL").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
            return qtd;
        });


        const primeiros5CPUCritico = jsonSeparados.primeiros5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.cpu_status_critico && row.cpu_status_critico == "CRITICO").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
            return qtd;
        });

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


        const primeiros5RAM = jsonSeparados.primeiros5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.ram_status && row.ram_status == "NORMAL").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
            return qtd;
        });

        const primeiros5RAMCritico = jsonSeparados.primeiros5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.ram_status_critico && row.ram_status_critico == "CRITICO").length;
            console.log(`bloco ${idx} -> CPU alertas Crítico:`, qtd);
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

        const primeiros5Disco = jsonSeparados.primeiros5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.disco_status && row.disco_status == "NORMAL").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
            return qtd;
        });

        const primeiros5DiscoCritico = jsonSeparados.primeiros5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.disco_status_critico && row.disco_status_critico == "CRITICO").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
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

        const primeiros5Download = jsonSeparados.primeiros5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.mb_recebidos_status && row.mb_recebidos_status == "NORMAL").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
            return qtd;
        });


        const primeiros5DownloadCritico = jsonSeparados.primeiros5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.mb_recebidos_status_critico && row.mb_recebidos_status_critico == "CRITICO").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
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

        const primeiros5Upload = jsonSeparados.primeiros5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.mb_enviados_status && row.mb_enviados_status == "NORMAL").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
            return qtd;
        });

        const primeiros5UploadCritico = jsonSeparados.primeiros5.map((bloco, idx) => {
            if (!Array.isArray(bloco)) return 0;
            const qtd = bloco.filter(row => row.mb_enviados_status_critico && row.mb_enviados_status_critico == "CRITICO").length;
            console.log(`bloco ${idx} -> CPU alertas:`, qtd);
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