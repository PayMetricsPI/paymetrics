document.addEventListener('DOMContentLoaded', async () => {
    const mac = sessionStorage.getItem('mac_selecionado');
    const nome = sessionStorage.getItem('nome_selecionado') || `Servidor: ${mac}`;
    const nomeEl = document.querySelector('.servidor_info .nome');
    if (!mac || !nomeEl) {
        if (nomeEl) nomeEl.textContent = "Servidor não selecionado";
        return;
    }
    nomeEl.textContent = nome;

    function updateKPIs(alertasServidor) {
        let countAberto = 0, countAndamento = 0, countFechado = 0;
        alertasServidor.forEach(a => {
            const st = (a.status || '').toLowerCase();
            if (st.includes('abert')) countAberto++;
            else if (st.includes('andamento')) countAndamento++;
            else if (st.includes('fech')) countFechado++;
        });
        document.querySelector('.kpi_aberto h1').textContent = countAberto;
        document.querySelector('.kpi_andamento h1').textContent = countAndamento;
        document.querySelector('.kpi_fechado h1').textContent = countFechado;
    }

    function normalizeStatus(status) {
        status = String(status || '').toLowerCase();
        if (status.includes('abert')) return 'aberto';
        if (status.includes('andamento')) return 'andamento';
        if (status.includes('fech')) return 'fechado';
        return status;
    }

    function renderTickets(filtro = 'aberto', alertasServidorParam = null) {
        const tickets = document.querySelector('.tickets');
        if (!tickets) return;
        tickets.innerHTML = '';
        const alertasList = alertasServidorParam || window._alertasServidor || [];
        let chamadosFiltrados = alertasList.filter(a => normalizeStatus(a.status) === filtro);

        const mostrarCritico = document.getElementById('checkCritico')?.checked;
        const mostrarAtencao = document.getElementById('checkAtencao')?.checked;
        chamadosFiltrados = chamadosFiltrados.filter(a => {
            if ((a.priority === 'Highest' || String(a.priority).toLowerCase() === 'highest') && mostrarCritico) return true;
            if ((a.priority === 'Medium' || String(a.priority).toLowerCase() === 'medium') && mostrarAtencao) return true;
            return false;
        });

        chamadosFiltrados.sort((a, b) => {
            const prioA = (a.priority || '').toLowerCase();
            const prioB = (b.priority || '').toLowerCase();
            if (prioA === 'medium' && prioB !== 'medium') return 1;
            if (prioA !== 'medium' && prioB === 'medium') return -1;
            return 0;
        });

        chamadosFiltrados.forEach(alerta => {
            const statusText =
                (alerta.priority === 'Highest' || String(alerta.priority).toLowerCase() === 'highest')
                    ? 'Crítico '
                    : 'Atenção';
            const statusColor =
                (alerta.priority === 'Highest' || String(alerta.priority).toLowerCase() === 'highest')
                    ? '#e53935'
                    : '#f7b116';
            const currentStatus = normalizeStatus(alerta.status);

            tickets.insertAdjacentHTML('beforeend', `
                <div class="card_ticket">
                    <div class="lado_esq">
                        <div class="info_text">
                            <div class="status" style="color:${statusColor}; font-weight:bold;">
                                ${statusText}
                            </div>
                            <p>
                                <strong>Ticket:</strong> #${alerta.issueKey} <br>
                                <strong>Componente:</strong> ${alerta.summary.split(':')[1] || ''} <br>
                                <strong>MAC:</strong> ${alerta.description}
                            </p>
                        </div>
                        <div class="lado_dir">
                            <p><strong>Status:</strong> ${alerta.status}</p>
                            <p><strong>Horário:</strong> ${(alerta.created || '').slice(11, 16) || ''}</p>
                        </div>
                    </div>
                </div>
            `);
        });

        if (chamadosFiltrados.length === 0) {
            tickets.innerHTML = "<p style='text-align:center;opacity:0.7;'>Nenhum chamado para este status</p>";
        }
    }

    async function refreshTicketsAndKPIs(filtro = 'aberto') {
        let alertas = [];
        try {
            const resp = await fetch('/jira/buscaralertas');
            alertas = await resp.json();
        } catch (err) {
            console.error('Erro ao buscar alertas do bucket:', err);
        }
        window._alertasServidor = alertas.filter(a => a.description === mac);
        updateKPIs(window._alertasServidor);
        renderTickets(filtro, window._alertasServidor);
    }

    await refreshTicketsAndKPIs('aberto');

    const filtroSelect = document.querySelector('.titulo_cha select');
    if (filtroSelect) {
        filtroSelect.addEventListener('change', function () {
            renderTickets(this.value || 'aberto', window._alertasServidor);
        });
    }

    document.getElementById('checkCritico').addEventListener('change', function() {
        renderTickets(document.querySelector('.titulo_cha select').value || 'aberto', window._alertasServidor);
    });
    document.getElementById('checkAtencao').addEventListener('change', function() {
        renderTickets(document.querySelector('.titulo_cha select').value || 'aberto', window._alertasServidor);
    });

    document.querySelector('.tickets').addEventListener('change', async function (e) {
        const select = e.target;
        if (!select.classList.contains('filter_card')) return;
        const ticketId = select.getAttribute('data-ticket-id');
        const novoStatus = select.value;
        if (!ticketId) {
            return;
        }
        await fetch('/jira/atualizarStatus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                issueKey: ticketId,
                novoStatus: novoStatus
            })
        });
        await refreshTicketsAndKPIs(document.querySelector('.titulo_cha select').value || 'aberto');
    });

});