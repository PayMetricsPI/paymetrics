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
        })
}

setInterval(buscarDados, 2000)
buscarDados()

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
let chartMBEnviados = null;
let chartMBRecebidos = null;

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
if(cpuChart) cpuChart.destroy();
  if(ramChart) ramChart.destroy();
  if(discoChart) discoChart.destroy();
  if(redeChart) redeChart.destroy();
  if (chartMBEnviados) chartMBEnviados.destroy();
  if (chartMBRecebidos) chartMBRecebidos.destroy(); 
  if(chartStatus) chartStatus.destroy();
  if (chartStatusRam) chartStatusRam.destroy();
  if (chartStatusDisco) chartStatusDisco.destroy();

                if (periodo === "1") {

                      ctxCpu = document.getElementById('CpuChart').getContext('2d');
                    cpuChart = new Chart(ctxCpu, {
                        type: 'bar',
                        data: {
                            labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
                            datasets: [{
                                label: 'CPU',
                                data: [30, 80, 50, 55, 45, 100],
                                backgroundColor: ['rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(242, 183, 48)',
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
                                    text: 'Picos de CPU',
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


                    const ctx1 = document.getElementById('statusChart');

                    chartStatus =  new Chart(ctx1, {
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
                            labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
                            datasets: [{
                                label: 'RAM',
                                data: [30, 80, 50, 55, 45, 100],
                                backgroundColor: ['rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(242, 183, 48)',
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
                                    text: 'Picos de Ram',
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

                    const ctx3 = document.getElementById('statusRamChart');

                    chartStatusRam =  new Chart(ctx3, {
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
                            labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
                            datasets: [{
                                label: 'DISCO',
                                data: [30, 80, 50, 55, 45, 100],
                                backgroundColor: ['rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(242, 183, 48)',
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
                                    text: 'Picos de Disco',
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


                    const ctx5 = document.getElementById('statusDiscoChart');

                    chartStatusDisco = new Chart(ctx5, {
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
                            labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
                            datasets: [{
                                label: 'Rede',
                                data: [30, 80, 50, 55, 45, 100],
                                backgroundColor: ['rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(242, 183, 48)',
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
                                    text: 'Picos de Rede',
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


                    ctxMBEnviados = document.getElementById('statusRedeChart');

                    chartMBEnviados = new Chart(ctxMBEnviados, {
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


                    ctxMBRecebidos = document.getElementById('statusRedeChart2');

                    chartMBRecebidos = new Chart(ctxMBRecebidos, {
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

                const ctxCpu = document.getElementById('CpuChart').getContext('2d');
                    cpuChart = new Chart(ctxCpu, {
                        type: 'bar',
                        data: {
                            labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
                            datasets: [{
                                label: 'CPU',
                                data: [50, 40, 70, 65, 75, 95],
                                backgroundColor: ['rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(242, 183, 48)',
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
                                    text: 'Picos de CPU',
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


                    const ctx1 = document.getElementById('statusChart');

                   chartStatus = new Chart(ctx1, {
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
                            labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
                            datasets: [{
                                label: 'RAM',
                                data: [30, 80, 50, 55, 45, 100],
                                backgroundColor: ['rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(242, 183, 48)',
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
                                    text: 'Picos de Ram',
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

                    const ctx3 = document.getElementById('statusRamChart');

                  chartStatusRam = new Chart(ctx3, {
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
                            labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
                            datasets: [{
                                label: 'DISCO',
                                data: [30, 80, 50, 55, 45, 100],
                                backgroundColor: ['rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(242, 183, 48)',
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
                                    text: 'Picos de Disco',
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


                    const ctx5 = document.getElementById('statusDiscoChart');

                    chartStatusDisco = new Chart(ctx5, {
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
                            labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
                            datasets: [{
                                label: 'Rede',
                                data: [30, 80, 50, 55, 45, 100],
                                backgroundColor: ['rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(242, 183, 48)',
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
                                    text: 'Picos de Rede',
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


                    ctxMBEnviados = document.getElementById('statusRedeChart');

                    chartMBEnviados = new Chart(ctxMBEnviados, {
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


                    ctxMBRecebidos = document.getElementById('statusRedeChart2');

                    chartMBRecebidos = new Chart(ctxMBRecebidos, {
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

               const ctxCpu = document.getElementById('CpuChart').getContext('2d');
                    cpuChart = new Chart(ctxCpu, {
                        type: 'bar',
                        data: {
                            labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
                            datasets: [{
                                label: 'CPU',
                                data: [50, 40, 70, 65, 75, 95],
                                backgroundColor: ['rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(242, 183, 48)',
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
                                    text: 'Picos de CPU',
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


                    const ctx1 = document.getElementById('statusChart');

                  chartStatus = new Chart(ctx1, {
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
                            labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
                            datasets: [{
                                label: 'RAM',
                                data: [30, 80, 50, 55, 45, 100],
                                backgroundColor: ['rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(242, 183, 48)',
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
                                    text: 'Picos de Ram',
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

                    const ctx3 = document.getElementById('statusRamChart');

                  chartStatusRam = new Chart(ctx3, {
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
                            labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
                            datasets: [{
                                label: 'DISCO',
                                data: [30, 80, 50, 55, 45, 100],
                                backgroundColor: ['rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(242, 183, 48)',
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
                                    text: 'Picos de Disco',
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


                    const ctx5 = document.getElementById('statusDiscoChart');

                    chartStatusDisco = new Chart(ctx5, {
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
                            labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
                            datasets: [{
                                label: 'Rede',
                                data: [30, 80, 50, 55, 45, 100],
                                backgroundColor: ['rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(242, 183, 48)',
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
                                    text: 'Picos de Rede',
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


                    ctxMBEnviados = document.getElementById('statusRedeChart');

                    chartMBEnviados = new Chart(ctxMBEnviados, {
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


                       ctxMBRecebidos = document.getElementById('statusRedeChart2');

                    chartMBRecebidos = new Chart(ctxMBRecebidos, {
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

               const ctxCpu = document.getElementById('CpuChart').getContext('2d');
                    cpuChart = new Chart(ctxCpu, {
                        type: 'bar',
                        data: {
                            labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
                            datasets: [{
                                label: 'CPU',
                                data: [50, 40, 70, 65, 75, 95],
                                backgroundColor: ['rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(242, 183, 48)',
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
                                    text: 'Picos de CPU',
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


                    const ctx1 = document.getElementById('statusChart');

                  chartStatus = new Chart(ctx1, {
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
                            labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
                            datasets: [{
                                label: 'RAM',
                                data: [30, 80, 50, 55, 45, 100],
                                backgroundColor: ['rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(242, 183, 48)',
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
                                    text: 'Picos de Ram',
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

                    const ctx3 = document.getElementById('statusRamChart');

                  chartStatusRam = new Chart(ctx3, {
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
                            labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
                            datasets: [{
                                label: 'DISCO',
                                data: [30, 80, 50, 55, 45, 100],
                                backgroundColor: ['rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(242, 183, 48)',
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
                                    text: 'Picos de Disco',
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


                    const ctx5 = document.getElementById('statusDiscoChart');

                    chartStatusDisco = new Chart(ctx5, {
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
                            labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
                            datasets: [{
                                label: 'Rede',
                                data: [30, 80, 50, 55, 45, 100],
                                backgroundColor: ['rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(192, 192, 192)',
                                    'rgb(242, 183, 48)',
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
                                    text: 'Picos de Rede',
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


                    ctxMBEnviados = document.getElementById('statusRedeChart');

                    chartMBEnviados = new Chart(ctxMBEnviados, {
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


                   ctxMBRecebidos = document.getElementById('statusRedeChart2');

                    chartMBRecebidos = new Chart(ctxMBRecebidos, {
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
            }
window.onload = function () {
    const Periodo = document.getElementById('periodo');
    Periodo.addEventListener('change', function () {
        atualizarGraficoPorPeriodo(this.value);
    });
    atualizarGraficoPorPeriodo(Periodo.value);
}