const fk_empresa = Number(sessionStorage.getItem('id'));

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.servidores_alertas');
    if (container) container.addEventListener('click', cardClick);
    carregarServidoresComAlertas();
});

function cardClick(e) {
    const card = e.target.closest('.servidor_card');
    if (!card) return;

    const nome = card.querySelector('.info_servidor .nome')?.textContent?.trim();
    const mac = card.querySelector('.info_servidor .mac')?.textContent?.trim();
    const id = card.dataset.id || card.getAttribute('data-id');

    if (id) sessionStorage.setItem('fk_servidor', String(id));
    if (nome) sessionStorage.setItem('servidor_nome', nome);
    if (mac) sessionStorage.setItem('servidor_mac', mac);

    window.location.href = 'servidor_jira.html';
}

async function carregarServidoresComAlertas() {
    if (!fk_empresa) {
        console.log('fk_empresa não foi encontrada');
        return;
    }

    let alertas = [];
    try {
        const resp = await fetch(`/jira/alertas/${fk_empresa}`);
        if (resp.ok) alertas = await resp.json();
        else {
            console.warn('Resposta de alertas não OK, fallback para vazio');
            alertas = [];
        }
    } catch (err) {
        console.warn('Falha ao buscar alertas, fallback para vazio', err);
        alertas = [];
    }

    alertas = Array.isArray(alertas) ? alertas.filter(a => a && a.fk_servidor != null) : [];
    const idsUnicos = [...new Set(alertas.map(a => a.fk_servidor).filter(id => id != null))];

    const container = document.querySelector('.servidores_alertas');
    if (!container) return;

    // limpa cards antigos
    container.querySelectorAll('.servidor_card').forEach(c => c.remove());
    if (idsUnicos.length === 0) {
        // opcional: exibir mensagem "nenhum alerta"
        return;
    }

    // buscar dados dos servidores em paralelo, com fallback para dados do alerta
    const servidores = await Promise.all(idsUnicos.map(async id => {
        try {
            const r = await fetch(`/servidores/${id}/${fk_empresa}`);
            if (r.ok) return await r.json();
        } catch (e) {}
        const alerta = alertas.find(a => a.fk_servidor === id) || {};
        return {
            id_servidor: id,
            nome: alerta.nome_servidor || `Servidor ${id}`,
            mac_address: alerta.mac || '—'
        };
    }));

    // renderizar cards
    servidores.filter(Boolean).forEach(s => {
        const servidorId = s.id_servidor || s.id;
        const alertsDoServidor = alertas.filter(a => a.fk_servidor === servidorId);

        // escolher prioridade mais severa presente
        const ordem = ['highest', 'medium'];
        let prioridadeEscolhida = null;
        for (const o of ordem) {
            if (alertsDoServidor.some(a => String(a.priority || '').toLowerCase() === o)) {
                prioridadeEscolhida = o;
                break;
            }
        }
        if (!prioridadeEscolhida && alertsDoServidor.length) {
            prioridadeEscolhida = String(alertsDoServidor[0].priority || '').toLowerCase();
        }

        const prioridadeInfo = mapPrioridade(prioridadeEscolhida);

        const card = document.createElement('div');
        card.className = 'servidor_card';
        card.setAttribute('data-id', servidorId);
        card.innerHTML = `
            <img src="./assets/icons/servidor_jira.png" alt="Servidor">
            <div class="info_servidor">
                <p class="nome">${s.nome || 'Servidor'}</p>
                <p class="mac">${s.mac_address || 'MAC'}</p>
            </div>
            <div class="status_badge" style="color: ${prioridadeInfo.color}; font-weight:700;">
                ${prioridadeInfo.label}
            </div>
        `;
        container.appendChild(card);
    });
}

function mapPrioridade(priority) {
    if (!priority) return { label: 'Crítico', color: '#e53935' };
    const p = String(priority).toLowerCase();
    if (p === 'highest') return { label: 'Highest', color: '#e53935' };
    if (p === 'medium') return { label: 'Medium', color: '#f7b116' };
    return { label: String(priority), color: '#e53935' };
}