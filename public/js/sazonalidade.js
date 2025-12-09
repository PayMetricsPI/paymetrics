async function calendar() {

    const key = "guilherme/hardware_previsoes.json";

    try {
        const res = await fetch('/BucketRoute/getS3Object', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
        });

        const data = await res.json();

        const events = []
        const calendarData = data.content.calendar;

        for (let i = 0; i < calendarData.length; i++) {
            const day = calendarData[i];
            events.push({
                start: day.date,
                allDay: true,
                className: day.alert ? 'pico' : ''
            });
        }

        const calendarEl = document.getElementById('calendar');

        const calendar = new FullCalendar.Calendar(calendarEl, {
            locale: 'pt-br',
            initialView: 'dayGridMonth',
            initialDate: '2026-01-01',

            headerToolbar: {
                left: 'prev',
                center: 'title',
                right: 'next'
            },

            validRange: {
                start: '2026-01-01',
                end: '2027-01-01'
            },

            showNonCurrentDates: false,
            events: events,

            dayHeaderContent: function (arg) {
                return arg.text.substring(0, 3).toUpperCase();
            },

            eventContent: function (arg) {
                if (arg.event.classNames.includes('pico')) {
                    return { html: '<div class="dia-alerta"></div>' };
                }
            }

        });

        calendar.render();


    } catch (err) {
        console.error(err);
        alert('Erro ao carregar JSON: ' + err.message);
    }
}

async function gemini() {
    const key = "guilherme/eventos_2026_gemini13959218756542317443.json";

    try {
        const res = await fetch('/BucketRoute/getS3Object', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
        });

        const data = await res.json();
        const insights = data.content;

        const container = document.getElementById("insightsContainer");
        container.innerHTML = "";

        for (let i = 0; i < insights.length; i++) {
            const item = insights[i];
            const evento = item.eventos[0];

            container.innerHTML += `
        <div class="carousel-item ${i === 0 ? "active" : ""}">
            <div class="row justify-content-center">
                <div class="col-12 col-md-12 col-lg-10 d-flex">
                    <div class="insight-card">
                        <h3>${formatarTexto(evento.nome)}</h3>
                        <small>${item.data}</small>
                        <div class="impacto-recomendacao">
                            <p><strong>Impacto:</strong> ${evento.impacto_hardware}</p>
                            <p><strong>Recomendação:</strong> ${evento.recomendacao_ti}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
        }

    } catch (e) {
        console.error("Erro ao carregar insights:", e);
    }
}

function formatarTexto(texto) {
    if (!texto) return "";

    const substituicoes = {
        'natal': 'Natal',
        'reveillon': 'Réveillon',
        'aulas': 'Volta às aulas',
        'carnaval': 'Carnaval',
        'dia das maes': 'Dia das mães',
        'dia dos namorados': 'Dia dos namorados',
        'festa junina': 'Festa junina',
        'amazon day': 'Amazon day',
        'dia das crianças': 'Dia das crianças',
        'halloween': 'Halloween',
        'blackfriday': 'Blackfriday',
        'pascoa': 'Páscoa'
    };

    let novo = texto.toLowerCase();

    Object.keys(substituicoes).forEach(padrao => {
        novo = novo.replace(new RegExp(`\\b${padrao}\\b`, "gi"), substituicoes[padrao]);
    });

    return novo.charAt(0).toUpperCase() + novo.slice(1);
}

function calcularMediaMovel(valores) {
    const medias = [];

    for (let i = 2; i < valores.length; i++) {
        const soma = valores[i] + valores[i - 1] + valores[i - 2];
        medias.push(soma / 3);
    }

    return medias;
}

function atualizarKPIs(contagemMensal) {
    const media = math.mean(contagemMensal).toFixed(2)

    const mediana = math.median(contagemMensal).toFixed(2);

    const desvioPadrao = math.std(contagemMensal, 'uncorrected').toFixed(2);

    document.getElementById("kpiMedia").textContent = media;
    document.getElementById("kpiMediana").textContent = mediana;
    document.getElementById("kpiDesvio").textContent = desvioPadrao;
}

function gerarGraficoMediaMovel(contagemMensal) {
    const mediaMovel = calcularMediaMovel(contagemMensal);

    const mediaMovelCompleto = Array(12).fill(null);

    for (let i = 0; i < mediaMovel.length; i++) {
        mediaMovelCompleto[i + 2] = mediaMovel[i];
    }

    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    const ctx = document.getElementById("graficoMediaMovel").getContext("2d");

    if (window.graficoMM3Instance) {
        window.graficoMM3Instance.destroy();
    }

    window.graficoMM3Instance = new Chart(ctx, {
        type: "line",
        data: {
            labels: meses,
            datasets: [
                {
                    label: "Picos previstos",
                    data: contagemMensal,
                    borderWidth: 3,
                    borderColor: "#FFAA00",
                    tension: 0.3,
                    pointRadius: 2
                },
                {
                    label: "Média móvel",
                    data: mediaMovelCompleto,
                    borderWidth: 3,
                    borderColor: "#AA33FF",
                    borderDash: [6, 4],
                    tension: 0.3,
                    pointRadius: 2
                }
            ]
        },
        options: {
            plugins: {
                legend: {
                    display: false,
                }
            },
            scales: {
                y: {
                    min: -1,
                    max: 6,
                    beginAtZero: true,
                    grid: {
                        color: '#B0B0B0',
                        borderDash: [2, 4],
                    },
                    ticks: {
                        color: '#B0B0B0',
                        font: {
                            family: 'Noto Sans'
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#B0B0B0',
                        font: {
                            family: 'Noto Sans'
                        }
                    }
                },
            },
        }
    });
}

async function gerarMapaIntensidade() {
    const key = "guilherme/hardware_previsoes.json";

    try {
        const res = await fetch('/BucketRoute/getS3Object', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
        });

        const data = await res.json();

        const calendar = data.content.calendar;

        const contagemMensal = Array.from({ length: 12 }, () => 0);

        calendar.forEach(item => {
            const mes = new Date(item.date).getMonth();

            if (item.alert === true) {
                contagemMensal[mes]++;
            }
        });

        atualizarKPIs(contagemMensal);
        gerarGraficoMediaMovel(contagemMensal);

        const mesesNome = [
            "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
            "Jul", "Ago", "Set", "Out", "Nov", "Dez"
        ];

        const container = document.getElementById("intensityMap");
        container.innerHTML = "";

        contagemMensal.forEach((valor, mes) => {
            let nivel = "level-low";
            if (valor >= 1) nivel = "level-medium";
            if (valor > 4) nivel = "level-high";

            const card = document.createElement("div");
            card.className = `intensity-card ${nivel}`;
            card.innerHTML = `
                <h3>${mesesNome[mes]}</h3>
                <div class="intensity-value">${valor}</div>
            `;
            container.appendChild(card);
        });

    } catch (e) {
        console.error("Erro ao gerar mapa de intensidade:", e);
    }
}
