const usersDiv = document.querySelector('.users');
const fk_empresa = Number(sessionStorage.getItem('id'));
const servidor = JSON.parse(sessionStorage.getItem('servidorSelecionado'));

if (servidor) {
    document.getElementById('servidorNome').textContent = servidor.nome;
    document.getElementById('modelo_cpu').textContent = servidor.tipo_cpu;
}

let dadosTempoReal;

function buscarDados(){
  fetch(`/metrica/obterUltimaPorMAC/${servidor.mac_address}`, { method: 'GET' })
    .then((resultado) => resultado.json())
    .then((data) => {
      dadosTempoReal = data;
      atualizarCPU(data.cpu)
      atualizarRAM(data.ram)
      atualizarDisco(data.disco)
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



const ctx = document.getElementById('CpuChart').getContext('2d');
new Chart(ctx, {
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

const chartCPU = new Chart(ctx1, {
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


const ctx2 = document.getElementById('RamChart').getContext('2d');

new Chart(ctx2, {
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

const chartRAM = new Chart(ctx3, {
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


const ctx4 = document.getElementById('DiscoChart').getContext('2d');

new Chart(ctx4, {
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

const chartDisco = new Chart(ctx5, {
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

const ctx6 = document.getElementById('RedeChart').getContext('2d');

new Chart(ctx6, {
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


const ctx7 = document.getElementById('statusRedeChart');

new Chart(ctx7, {
    type: 'doughnut',
    data: {
        labels: [],
        datasets: [{
            label: 'Rede',
            data: [100],
            backgroundColor: ['rgb(255,44,44)'],
            hoverOffset: 4,
            borderWidth: 0,
        }]
    },
    options: {
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
            ctx.save();

            ctx.font = 'bold 30px Arial';
            ctx.fillStyle = '#333';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText('100%', width / 2, height / 2 + 10);

            ctx.font = 'bold 22px Arial';
            ctx.fillStyle = '#000';
            ctx.fillText('Em uso (upload)', width / 2, height / 2 + 60);

            ctx.restore();
        }
    }]
});


const ctx8 = document.getElementById('statusRedeChart2');

new Chart(ctx8, {
    type: 'doughnut',
    data: {
        labels: [],
        datasets: [{
            label: 'Rede',
            data: [100],
            backgroundColor: ['rgb(255,44,44)'],
            hoverOffset: 4,
            borderWidth: 0,
        }]
    },
    options: {
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
            ctx.save();

            ctx.font = 'bold 30px Arial';
            ctx.fillStyle = '#333';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText('100%', width / 2, height / 2 + 10);

            ctx.font = 'bold 22px Arial';
            ctx.fillStyle = '#000';
            ctx.fillText('Em uso (download)', width / 2, height / 2 + 60);

            ctx.restore();
        }
    }]
});