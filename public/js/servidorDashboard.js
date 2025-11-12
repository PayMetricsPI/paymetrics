const usersDiv = document.querySelector('.users');
const fk_empresa = Number(sessionStorage.getItem('id'));
const servidor = JSON.parse(sessionStorage.getItem('servidorSelecionado'));

if (servidor) {
    document.getElementById('servidorNome').textContent = servidor.nome;
    document.getElementById('modelo_cpu').textContent = servidor.tipo_cpu;
    document.getElementById('capacidade_ram').textContent = servidor.ram + "GB";
    document.getElementById('capacidade_disco').textContent = servidor.disco + "TB";
}

function formatarDiferenca(timestamp) {
    const agora = Date.now() / 1000;
    const diffSegundos = Math.abs(agora - timestamp);

    const dias = Math.floor(diffSegundos / (60 * 60 * 24));
    const horas = Math.floor((diffSegundos % (60 * 60 * 24)) / (60 * 60));
    const minutos = Math.floor((diffSegundos % (60 * 60)) / 60);

    return `${dias.toString().padStart(2, '0')} dias, ${horas.toString().padStart(2, '0')} horas e ${minutos.toString().padStart(2, '0')} minutos`;
}

function buscarDados() {
    fetch(`/metrica/obterUltimaPorMAC/${servidor.mac_address}`, { method: 'GET' })
        .then((resultado) => resultado.json())
        .then((data) => {
            atualizarCPU(data.cpu)
            atualizarRAM(data.ram)
            atualizarDisco(data.disco)
            atualizarMBEnviados(data.mbEnviados)
            atualizarMBRecebidos(data.mbRecebidos)
            atualizarBootTime(data.tempoBoot)
        }).catch(() => {
            console.log("rode o python :)")
        });


    const id_servidor = JSON.parse(sessionStorage.getItem('servidorSelecionado')).id_servidor

    fetch("/parametro/obterParametro/" + id_servidor, { method: 'GET' })
        .then((resultado) => resultado.json())
        .then((data) => {
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

let chartCPU = null;
let chartRAM = null;
let chartDisco = null;
let chartMBEnviados = null;
let chartMBRecebidos = null;

function atualizarCPU(valorCPU) {
    chartCPU.data.datasets[0].data = [valorCPU, 100 - valorCPU];
    chartCPU.update();
}
function atualizarRAM(valorRAM) {
    chartRAM.data.datasets[0].data = [valorRAM, 100 - valorRAM];
    chartRAM.update();
}
function atualizarDisco(valorDisco) {
    chartDisco.data.datasets[0].data = [valorDisco, 100 - valorDisco];
    chartDisco.update();
}
function atualizarMBRecebidos(valorMbRecebidos) {
    chartMBRecebidos.data.datasets[0].data = [valorMbRecebidos, 100 - valorMbRecebidos];
    chartMBRecebidos.update();
}
function atualizarMBEnviados(valorMbEnviados) {
    chartMBEnviados.data.datasets[0].data = [valorMbEnviados, 100 - valorMbEnviados];
    chartMBEnviados.update();
}
function atualizarBootTime(bootTime) {
    const boot_time = document.getElementById('boot_time');
    boot_time.innerHTML = formatarDiferenca(bootTime)
}

const Periodo = document.getElementById('periodo');
Periodo.addEventListener('change', function () {
    const valorSelecionado = this.value;
    atualizarGraficoPorPeriodo(valorSelecionado);
});

let cpuChart = null;
let ramChart = null;
let discoChart = null;
let redeChart = null;
let redeChart2 = null;
let reqChart = null;

let chartStatus = null;
let chartStatusRam = null;
let chartStatusDisco = null;

function inicializarDashboard() {
    const Periodo = document.getElementById('periodo');
    Periodo.addEventListener('change', function () {
        atualizarGraficoPorPeriodo(this.value);
    });
    atualizarGraficoPorPeriodo(Periodo.value);
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

    if (periodo === "1") {

        ctxCpu = document.getElementById('CpuChart').getContext('2d');
        cpuChart = new Chart(ctxCpu, {
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
                        text: 'Quantidade de alertas - CPU',
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


        const ctxram = document.getElementById('RamChart').getContext('2d');

        ramChart = new Chart(ctxram, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'RAM',
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
                        text: 'Quantidade de alertas - RAM',
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


        const ctxdisco = document.getElementById('DiscoChart').getContext('2d');

        discoChart = new Chart(ctxdisco, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'DISCO',
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
                        text: 'Quantidade de Alertas - Disco',
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

        const ctxrede = document.getElementById('RedeChart').getContext('2d');

        redeChart = new Chart(ctxrede, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'Rede',
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
                        text: 'Quantidade de Alertas - Download',
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

        ctxrede2 = document.getElementById('RedeChart2').getContext('2d');
        redeChart2 = new Chart(ctxrede2, {
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
                        text: 'Quantidade de alertas - Upload',
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
    }

    else if (periodo === "2") {

        const ctxCpu = document.getElementById('CpuChart').getContext('2d');
        cpuChart = new Chart(ctxCpu, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'CPU',
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
                        text: 'Quantidade de alertas - CPU',
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


        const ctxram = document.getElementById('RamChart').getContext('2d');

        ramChart = new Chart(ctxram, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'RAM',
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
                        text: 'Quantidade de alertas - RAM',
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


        const ctxdisco = document.getElementById('DiscoChart').getContext('2d');

        discoChart = new Chart(ctxdisco, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'DISCO',
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
                        text: 'Quantidade de Alertas - Disco',
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

        const ctxrede = document.getElementById('RedeChart').getContext('2d');

        redeChart = new Chart(ctxrede, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'Rede',
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
                        text: 'Quantidade de Alertas - Download',
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

        ctxrede2 = document.getElementById('RedeChart2').getContext('2d');
        redeChart2 = new Chart(ctxrede2, {
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
                        text: 'Quantidade de alertas - Upload',
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


    }

    if (periodo === "3") {

        const ctxCpu = document.getElementById('CpuChart').getContext('2d');
        cpuChart = new Chart(ctxCpu, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'CPU',
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
                        text: 'Quantidade de alertas - CPU',
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


        const ctxram = document.getElementById('RamChart').getContext('2d');

        ramChart = new Chart(ctxram, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'RAM',
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
                        text: 'Quantidade de alertas - RAM',
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


        const ctxdisco = document.getElementById('DiscoChart').getContext('2d');

        discoChart = new Chart(ctxdisco, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'DISCO',
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
                        text: 'Quantidade de Alertas - Disco',
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

        const ctxrede = document.getElementById('RedeChart').getContext('2d');

        redeChart = new Chart(ctxrede, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'Rede',
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
                        text: 'Quantidade de Alertas - Download',
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

        ctxrede2 = document.getElementById('RedeChart2').getContext('2d');
        redeChart2 = new Chart(ctxrede2, {
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
                        text: 'Quantidade de alertas - Upload',
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


    }

    if (periodo === "4") {

        const ctxCpu = document.getElementById('CpuChart').getContext('2d');
        cpuChart = new Chart(ctxCpu, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'CPU',
                    data: [85, 45, 90, 60, 65, 97],
                    backgroundColor: ['rgb(242, 183, 48)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(255, 0, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(255, 0, 0, 1)',
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
                        text: 'Quantidade de alertas - CPU',
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


        const ctxram = document.getElementById('RamChart').getContext('2d');

        ramChart = new Chart(ctxram, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'RAM',
                    data: [85, 45, 90, 60, 65, 97],
                    backgroundColor: ['rgb(242, 183, 48)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(255, 0, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(255, 0, 0, 1)',
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
                        text: 'Quantidade de alertas - RAM',
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


        const ctxdisco = document.getElementById('DiscoChart').getContext('2d');

        discoChart = new Chart(ctxdisco, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'DISCO',
                    backgroundColor: ['rgb(242, 183, 48)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(255, 0, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(255, 0, 0, 1)',
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
                        text: 'Quantidade de Alertas - Disco',
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

        const ctxrede = document.getElementById('RedeChart').getContext('2d');

        redeChart = new Chart(ctxrede, {
            type: 'bar',
            data: {
                labels: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
                datasets: [{
                    label: 'Rede',
                    data: [85, 45, 90, 60, 65, 97],
                    backgroundColor: ['rgb(242, 183, 48)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(255, 0, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(29, 173, 0, 1)',
                        'rgba(255, 0, 0, 1)',
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
                        text: 'Quantidade de Alertas - Download',
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

        ctxrede2 = document.getElementById('RedeChart2').getContext('2d');
        redeChart2 = new Chart(ctxrede2, {
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
                        text: 'Quantidade de alertas - Upload',
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

    }
}
window.onload = function () {
    const Periodo = document.getElementById('periodo');
    Periodo.addEventListener('change', function () {
        atualizarGraficoPorPeriodo(this.value);
    });
    atualizarGraficoPorPeriodo(Periodo.value);

    setInterval(buscarDados, 2000)
    buscarDados()
}