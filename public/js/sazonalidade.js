async function getDataForCalendar() {

    const nome = sessionStorage.getItem('NOME_USUARIO');
    document.getElementById('welcome').innerText = `${nome}`;

    const key = "pred/hardware_previsoes.json";

    try {
        const res = await fetch('/BucketRoute/getS3Object', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
        });

        const data = await res.json();
        console.log("Resposta da API:", data);

        const events = data.content.calendar.map(day => ({
            start: day.date,
            allDay: true,
            className: day.alert ? 'pico' : ''
        }));

        const allEvents = [
            ...events,
            ...eventosSazonais.map(e => ({ ...e }))
        ];

        const calendarEl = document.getElementById('calendar');

        const calendar = new FullCalendar.Calendar(calendarEl, {
            locale: 'en',
            initialView: 'dayGridMonth',
            initialDate: '2026-01-01',

            headerToolbar: {
                left: 'prev',
                center: 'title',
                right: 'next'
            },

            titleFormat: {
                year: 'numeric',
                month: 'long'
            },

            validRange: {
                start: '2026-01-01',
                end: '2027-01-01'
            },

            showNonCurrentDates: true,
            events: allEvents,

            dayHeaderContent: (arg) => arg.text.substring(0, 3).toUpperCase(),

            eventContent: function (arg) {
                if (arg.event.classNames.includes('pico')) {
                    return { html: '<div class="dia-alerta"></div>' };
                }
            }
        });

        calendar.render();

        function corrigirDiasForaDoMes() {
            document.querySelectorAll('.fc-daygrid-day.fc-day-other').forEach(el => {
                el.style.backgroundColor = '#ffffff';
                el.style.color = 'black';
            });
        }

        calendar.on('datesSet', corrigirDiasForaDoMes);
        corrigirDiasForaDoMes();


    } catch (err) {
        console.error(err);
        alert('Erro ao carregar JSON: ' + err.message);
    }
}

async function getDataForInsight() {
    const key = "output/eventos_2026_gemini14817667377260867836.json";

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


