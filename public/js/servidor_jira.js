document.addEventListener('DOMContentLoaded', async () => {
    const componentSelect = document.getElementById('componentFilter');
    const nomeEl = document.querySelector('.servidor_info .nome');
    const filtroSelect = document.querySelector('.titulo_cha select');
    const checkCritico = document.getElementById('checkCritico');
    const checkAtencao = document.getElementById('checkAtencao');
    const ticketsContainer = document.querySelector('.tickets');

    const mac = sessionStorage.getItem('mac_selecionado');
    const nome = sessionStorage.getItem('nome_selecionado') || `Servidor: ${mac}`;
    if (!nomeEl) {
        console.warn('Elemento .servidor_info .nome não encontrado no DOM.');
    } else {
        if (!mac) nomeEl.textContent = "Servidor não selecionado";
        else nomeEl.textContent = nome;
    }

    function normalizeStatus(status) {
        status = String(status || '').toLowerCase();
        if (status.includes('abert')) return 'aberto';
        if (status.includes('andamento')) return 'andamento';
        if (status.includes('fech')) return 'fechado';
        return status || '';
    }

    function getComponentFromAlert(alert) {
        if (alert.component) return String(alert.component).trim();
        if (alert.components && Array.isArray(alert.components) && alert.components.length) {
            return String(alert.components[0]).trim();
        }

        if (alert.summary && typeof alert.summary === 'string') {
            const s = alert.summary.trim();

            const colonParts = s.split(':');
            if (colonParts.length >= 2) {
                const after = colonParts.slice(1).join(':').trim();
                const first = after.split(/[|\-\/\\()]/)[0].trim();
                if (first) return first;
            }

            const parenMatch = s.match(/\(([^)]+)\)\s*$/);
            if (parenMatch && parenMatch[1]) return parenMatch[1].trim();

            const words = s.split(/\s+/);
            if (words.length) {
                const last = words[words.length - 1].replace(/[\W_]+/g, '').trim();
                if (last) return last;
            }
        }

        return '';
    }

    function updateKPIs(alertasServidor) {
        if (!alertasServidor) return;
        let countAberto = 0, countAndamento = 0, countFechado = 0;
        alertasServidor.forEach(a => {
            const st = normalizeStatus(a.status);
            if (st === 'aberto') countAberto++;
            else if (st === 'andamento') countAndamento++;
            else if (st === 'fechado') countFechado++;
        });
        const elAberto = document.querySelector('.kpi_aberto h1');
        const elAndamento = document.querySelector('.kpi_andamento h1');
        const elFechado = document.querySelector('.kpi_fechado h1');
        if (elAberto) elAberto.textContent = countAberto;
        if (elAndamento) elAndamento.textContent = countAndamento;
        if (elFechado) elFechado.textContent = countFechado;
    }

    function populateComponentFilter(alertasList) {
        if (!componentSelect) return;

        const map = new Map();

        alertasList.forEach(a => {
            const raw = (getComponentFromAlert(a) || '').trim();
            if (!raw) return;
            const normalized = raw.toLowerCase();
            if (!map.has(normalized)) map.set(normalized, raw);
        });

        componentSelect.innerHTML = '';
        const emptyOpt = document.createElement('option');
        emptyOpt.value = '';
        emptyOpt.textContent = 'Todos os componentes';
        componentSelect.appendChild(emptyOpt);

        Array.from(map.values())
            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
            .forEach(label => {
                const value = label.trim();
                const opt = document.createElement('option');
                opt.value = value;
                opt.textContent = value;
                componentSelect.appendChild(opt);
            });
    }

    function formatDateTime(raw) {
        if (!raw) return { time: '', date: '' };

        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
            const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const date = d.toLocaleDateString('pt-BR');
            return { time, date };
        }

        const datePart = (raw.length >= 10) ? raw.slice(0, 10) : '';
        const timePart = (raw.length >= 16) ? raw.slice(11, 16) : '';
        let dateFormatted = datePart;
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
            const [y, m, d2] = datePart.split('-');
            dateFormatted = `${d2}/${m}/${y}`;
        }
        return { time: timePart, date: dateFormatted };
    }

    function renderTickets(filtro = 'aberto', alertasServidorParam = null) {
        if (!ticketsContainer) {
            console.warn('Container .tickets não encontrado.');
            return;
        }
        ticketsContainer.innerHTML = '';
        const alertasList = alertasServidorParam || window._alertasServidor || [];
        let chamadosFiltrados = alertasList.filter(a => normalizeStatus(a.status) === filtro);

        const mostrarCritico = checkCritico ? checkCritico.checked : true;
        const mostrarAtencao = checkAtencao ? checkAtencao.checked : true;

        chamadosFiltrados = chamadosFiltrados.filter(a => {
            const prio = (a.priority || '').toLowerCase();
            if ((prio === 'highest' || prio === 'critical') && mostrarCritico) return true;
            if ((prio === 'medium' || prio === 'minor' || prio === 'low') && mostrarAtencao) return true;
            return (!a.priority) ? true : false;
        });

        const selectedComponent = componentSelect ? (componentSelect.value || '').trim().toLowerCase() : '';
        if (selectedComponent) {
            chamadosFiltrados = chamadosFiltrados.filter(a => {
                const comp = (getComponentFromAlert(a) || '').trim().toLowerCase();
                return comp === selectedComponent;
            });
        }

        chamadosFiltrados.sort((a, b) => {
            const prioA = (a.priority || '').toLowerCase();
            const prioB = (b.priority || '').toLowerCase();
            if (prioA === 'medium' && prioB !== 'medium') return 1;
            if (prioA !== 'medium' && prioB === 'medium') return -1;
            return 0;
        });

        chamadosFiltrados.forEach(alerta => {
            const isCritico = ((alerta.priority || '').toString().toLowerCase() === 'highest' || (alerta.priority || '').toString().toLowerCase() === 'critical');
            const statusText = isCritico ? 'Crítico' : 'Atenção';
            const statusColor = isCritico ? '#e53935' : '#f7b116';
            const compDisplay = getComponentFromAlert(alerta) || '';

            const createdRaw = alerta.created || alerta.created_at || alerta.fields?.created || '';
            const { time, date } = formatDateTime(createdRaw);

            const cardHtml = `
                <div class="card_ticket" data-component="${compDisplay}">
                    <div class="lado_esq">
                        <div class="info_text">
                            <div class="status" style="color:${statusColor};">${statusText}</div>
                            <p>
                                <strong>Ticket:</strong> #${alerta.issueKey || ''} <br>
                                <strong>Componente:</strong> ${compDisplay} <br>
                                <strong>MAC:</strong> ${alerta.description || ''}
                            </p>
                        </div>
                    </div>
                    <div class="lado_dir">
                        <p><strong>Status:</strong> ${alerta.status || ''}</p>
                        <p class="horario"><strong>Horário:</strong> ${time || ''}</p>
                        <p class="horario"><strong>Dia:</strong> ${date || ''}</p>
                    </div>
                </div>
            `;
            ticketsContainer.insertAdjacentHTML('beforeend', cardHtml);
        });

        if (chamadosFiltrados.length === 0) {
            ticketsContainer.innerHTML = "<p style='text-align:center;opacity:0.7;margin:18px;'>Nenhum chamado para este filtro</p>";
        }
    }

    async function refreshTicketsAndKPIs(filtro = 'aberto') {
        let alertas = [];
        try {
            const resp = await fetch('/jira/buscaralertas');
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            alertas = await resp.json();
        } catch (err) {
            console.error('Erro ao buscar alertas do bucket:', err);
            alertas = [];
        }
        const alertasServidor = (mac) ? alertas.filter(a => String(a.description || '') === String(mac)) : alertas;
        window._alertasServidor = alertasServidor;
        updateKPIs(alertasServidor);
        populateComponentFilter(alertasServidor);
        renderTickets(filtro, alertasServidor);
    }

    await refreshTicketsAndKPIs('aberto');

    if (filtroSelect) {
        filtroSelect.addEventListener('change', function () {
            const val = this.value || 'aberto';
            renderTickets(val, window._alertasServidor);
        });
    }
    if (componentSelect) {
        componentSelect.addEventListener('change', function () {
            renderTickets(filtroSelect ? (filtroSelect.value || 'aberto') : 'aberto', window._alertasServidor);
        });
    }
    if (checkCritico) {
        checkCritico.addEventListener('change', () => {
            renderTickets(filtroSelect ? (filtroSelect.value || 'aberto') : 'aberto', window._alertasServidor);
        });
    }
    if (checkAtencao) {
        checkAtencao.addEventListener('change', () => {
            renderTickets(filtroSelect ? (filtroSelect.value || 'aberto') : 'aberto', window._alertasServidor);
        });
    }

    if (ticketsContainer) {
        ticketsContainer.addEventListener('change', async function (e) {
            const target = e.target;
            if (!target) return;
            if (target.classList && target.classList.contains('filter_card')) {
                const ticketId = target.getAttribute('data-ticket-id');
                const novoStatus = target.value;
                if (!ticketId) return;
                try {
                    await fetch('/jira/atualizarStatus', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ issueKey: ticketId, novoStatus })
                    });
                } catch (err) {
                    console.error('Erro ao atualizar status:', err);
                }
                await refreshTicketsAndKPIs(filtroSelect ? (filtroSelect.value || 'aberto') : 'aberto');
            }
        });
    }
});