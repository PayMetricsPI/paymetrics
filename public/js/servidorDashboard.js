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

//     function inicializarClickNosAlertas() {
//     const mapaAlertasParaGraficos = {
//         'cpu': 'CpuChart',
//         'ram': 'RamChart',
//         'disco': 'DiscoChart',
//         'upload': 'RedeChart2',
//         'download': 'RedeChart'
//     };

//     Object.keys(mapaAlertasParaGraficos).forEach(tipo => {
//         const card = document.querySelector(`.${tipo}`);
//         const graficoId = mapaAlertasParaGraficos[tipo];

//         if (card) {
//             card.style.cursor = 'pointer'; // muda o cursor para indicar clique
//             card.addEventListener('click', () => {
//                 const grafico = document.getElementById(graficoId);
//                 if (grafico) {
//                     grafico.scrollIntoView({ behavior: 'smooth', block: 'start' });
//                 }
//             });
//         }
//     });
// }

// // chama essa função após o DOM estar carregado
// window.addEventListener('DOMContentLoaded', () => {
//     inicializarClickNosAlertas();
// });

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
        if (!row.datetime) return;
        const ts = new Date(row.datetime.replace(' ', 'T')).getTime();
        const diffHoras = (agora - ts) / (1000 * 60 * 60);

        if (i < 10) {
            console.log('AMOSTRA', i, row.datetime, '→ diffHoras =', diffHoras.toFixed(1));
        }

        // 1 hora
        if (diffHoras <= 1) dadosPorPeriodo[1].push(row);

        // 1 dia
        if (diffHoras <= 24) dadosPorPeriodo[2].push(row);

        // 3 dias — pega apenas linhas com ts >= início de 3 dias atrás
        const inicio3Dias = new Date();
        inicio3Dias.setHours(0, 0, 0, 0);
        inicio3Dias.setDate(inicio3Dias.getDate() - 2); // início exato de terça
        if (ts >= inicio3Dias.getTime()) dadosPorPeriodo[3].push(row);

        // 7 dias
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

        if (periodo == 1) { // últimos 60 min
            inicioPeriodo = new Date(Date.now() - 60 * 60000);
        } else if (periodo == 2) { // últimas 24h
            inicioPeriodo = new Date(Date.now() - 24 * 3600000);
        } else if (periodo == 3) { // últimos 3 dias
            inicioPeriodo = new Date();
            inicioPeriodo.setHours(0, 0, 0, 0);
            inicioPeriodo.setDate(inicioPeriodo.getDate() - 2);
        } else if (periodo == 4) { // últimos 7 dias
            inicioPeriodo = new Date();
            inicioPeriodo.setHours(0, 0, 0, 0);
            inicioPeriodo.setDate(inicioPeriodo.getDate() - 6);
        }

        dataFiltro.forEach(row => {
            if (!row.datetime) return;
            const ts = new Date(row.datetime.replace(' ', 'T'));

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

    // function distribuirAlertasNasLabels(dataFiltro, labels, periodo) {

    //     let contCPU = Array(labels.length).fill(0);
    //     let contCPUCritico = Array(labels.length).fill(0);

    //     let contRAM = Array(labels.length).fill(0);
    //     let contRAMCritico = Array(labels.length).fill(0);

    //     let contDisco = Array(labels.length).fill(0);
    //     let contDiscoCritico = Array(labels.length).fill(0);

    //     let contDownload = Array(labels.length).fill(0);
    //     let contDownloadCritico = Array(labels.length).fill(0);

    //     let contUpload = Array(labels.length).fill(0);
    //     let contUploadCritico = Array(labels.length).fill(0);

    //     const agora = Date.now();

    //     dataFiltro.forEach(row => {
    //         if (!row.datetime) return;

    //         const ts = new Date(row.datetime.replace(" ", "T")).getTime();

    //         let index = -1;

    //         if (periodo == 1) {
    //             let diffMin = Math.floor((agora - ts) / 60000);
    //             index = Math.floor((60 - diffMin) / 15);
    //         }
    //         else if (periodo == 2) {
    //             let diffH = Math.floor((agora - ts) / 3600000);
    //             index = Math.floor((24 - diffH) / 6);
    //         }
    //         else if (periodo == 3) {
    //             let diffD = Math.floor((agora - ts) / 86400000);
    //             index = 2 - diffD;
    //         }
    //         else if (periodo == 4) {
    //             let diffD = Math.floor((agora - ts) / 86400000);
    //             index = 6 - diffD;
    //         }

    //         if (index < 0 || index >= labels.length) return;

    //         if (row.cpu_status === "NORMAL") contCPU[index]++;
    //         if (row.cpu_status_critico === "CRITICO") contCPUCritico[index]++;

    //         if (row.ram_status === "NORMAL") contRAM[index]++;
    //         if (row.ram_status_critico === "CRITICO") contRAMCritico[index]++;

    //         if (row.disco_status === "NORMAL") contDisco[index]++;
    //         if (row.disco_status_critico === "CRITICO") contDiscoCritico[index]++;

    //         if (row.mb_recebidos_status === "NORMAL") contDownload[index]++;
    //         if (row.mb_recebidos_status_critico === "CRITICO") contDownloadCritico[index]++;

    //         if (row.mb_enviados_status === "NORMAL") contUpload[index]++;
    //         if (row.mb_enviados_status_critico === "CRITICO") contUploadCritico[index]++;
    //     });

    //     return {
    //         contCPU,
    //         contCPUCritico,
    //         contRAM,
    //         contRAMCritico,
    //         contDisco,
    //         contDiscoCritico,
    //         contDownload,
    //         contDownloadCritico,
    //         contUpload,
    //         contUploadCritico
    //     };
    // }

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

        let labels = gerarLabelsDinamicas(Number(periodo));

        const { contNormal, contCritico } = distribuirAlertasNasLabels(
            dataFiltro,
            labels,
            Number(periodo)
        );


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

            const {
                contCPU,
                contCPUCritico
            } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

            console.log('CPU ultimos5 por bloco:', qtdAlertasCPU);

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

            const qtdAlertasRAM = contarAlertasPorPeriodo(dataFiltro, "ram_status");
            const qtdAlertasRAMcritico = contarAlertasPorPeriodo(dataFiltro, "ram_status_critico");

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

            const qtdAlertasDisco = contarAlertasPorPeriodo(dataFiltro, "disco_status");
            const qtdAlertasDiscocritico = contarAlertasPorPeriodo(dataFiltro, "disco_status_critico");

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

            const qtdAlertasDownload = contarAlertasPorPeriodo(dataFiltro, "mb_recebidos_status");
            const qtdAlertasDownloadcritico = contarAlertasPorPeriodo(dataFiltro, "mb_recebidos_status_critico");

            const {
                contDonwload,
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
                            data: contDonwload,
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

            const qtdAlertasUpload = contarAlertasPorPeriodo(dataFiltro, "mb_enviados_status");
            const qtdAlertasUploadcritico = contarAlertasPorPeriodo(dataFiltro, "mb_enviados_status_critico");

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

            const {
                contCPU,
                contCPUCritico
            } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

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

            const qtdAlertasRAM = contarAlertasPorPeriodo(dataFiltro, "ram_status");
            const qtdAlertasRAMcritico = contarAlertasPorPeriodo(dataFiltro, "ram_status_critico");

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

        const qtdAlertasDisco = contarAlertasPorPeriodo(dataFiltro, "disco_status");
        const qtdAlertasDiscocritico = contarAlertasPorPeriodo(dataFiltro, "disco_status_critico");

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

        const qtdAlertasDownload = contarAlertasPorPeriodo(dataFiltro, "mb_recebidos_status");
        const qtdAlertasDownloadcritico = contarAlertasPorPeriodo(dataFiltro, "mb_recebidos_status_critico");

        const {
            contDonwload,
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
                        data: contDonwload,
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

        const qtdAlertasUpload = contarAlertasPorPeriodo(dataFiltro, "mb_enviados_status");
        const qtdAlertasUploadcritico = contarAlertasPorPeriodo(dataFiltro, "mb_enviados_status_critico");

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

        const qtdAlertasRAM = contarAlertasPorPeriodo(dataFiltro, "ram_status");
        const qtdAlertasRAMcritico = contarAlertasPorPeriodo(dataFiltro, "ram_status_critico");

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

        const qtdAlertasDisco = contarAlertasPorPeriodo(dataFiltro, "disco_status");
        const qtdAlertasDiscocritico = contarAlertasPorPeriodo(dataFiltro, "disco_status_critico");


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


        const qtdAlertasDownload = contarAlertasPorPeriodo(dataFiltro, "mb_recebidos_status");
        const qtdAlertasDownloadcritico = contarAlertasPorPeriodo(dataFiltro, "mb_recebidos_status_critico");

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

        const qtdAlertasUpload = contarAlertasPorPeriodo(dataFiltro, "mb_enviados_status");
        const qtdAlertasUploadcritico = contarAlertasPorPeriodo(dataFiltro, "mb_enviados_status_critico");

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

        const {
            contCPU,
            contCPUCritico
        } = distribuirAlertasNasLabels(dataFiltro, labels, Number(periodo));

        console.log('cpuAlertasPorBloco:', qtdAlertasCPU)

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


        const qtdAlertasRAM = contarAlertasPorPeriodo(dataFiltro, "ram_status");
        const qtdAlertasRAMcritico = contarAlertasPorPeriodo(dataFiltro, "ram_status_critico");

        alertaRAM = qtdAlertasRAM
        alertaCriticoRAM = qtdAlertasRAMcritico


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

        const qtdAlertasDisco = contarAlertasPorPeriodo(dataFiltro, "disco_status");
        const qtdAlertasDiscocritico = contarAlertasPorPeriodo(dataFiltro, "disco_status_critico");

        alertaDisco = qtdAlertasDisco
        alertaCriticoDisco = qtdAlertasDiscocritico

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

        const qtdAlertasDownload = contarAlertasPorPeriodo(dataFiltro, "mb_recebidos_status");
        const qtdAlertasDownloadcritico = contarAlertasPorPeriodo(dataFiltro, "mb_recebidos_status_critico");

        alertaDownload = qtdAlertasDownload
        alertaCriticoDownload = qtdAlertasDownloadcritico

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

        const qtdAlertasUpload = contarAlertasPorPeriodo(dataFiltro, "mb_enviados_status");
        const qtdAlertasUploadcritico = contarAlertasPorPeriodo(dataFiltro, "mb_enviados_status_critico");

        alertaUpload = qtdAlertasUpload
        alertaCriticoUpload = qtdAlertasUploadcritico

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
