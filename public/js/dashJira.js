const fk_empresa = Number(sessionStorage.getItem('id'));

document.addEventListener('DOMContentLoaded', () => {
    carregarKPIs();
    carregarServidoresComAlertas();
});

async function carregarKPIs() {
    try {
        const resp = await fetch('/jira/buscaralertas');
        const alertas = await resp.json();

        const totalCritico = alertas.filter(a =>
            a.priority && a.priority.toLowerCase() === "highest"
        ).length;

        const totalAtencao = alertas.filter(a =>
            a.priority && a.priority.toLowerCase() === "medium"
        ).length;

        document.querySelector('.kpi_critico h1').textContent = totalCritico;
        document.querySelector('.kpi_atencao h1').textContent = totalAtencao;
    } catch (err) {
        document.querySelector('.kpi_critico h1').textContent = 0;
        document.querySelector('.kpi_atencao h1').textContent = 0;
        console.error('Não foi possível buscar alertas do bucket', err);
    }
}
document.addEventListener('click', function (e) {
    const card = e.target.closest('.servidor_card');
    if (card && card.parentElement && card.parentElement.classList.contains('servidores_alertas')) {
        const mac = card.getAttribute('data-mac');
        const nome = card.getAttribute('data-nome'); 
        if (mac) sessionStorage.setItem('mac_selecionado', mac);
        if (nome) sessionStorage.setItem('nome_selecionado', nome);
        window.location.href = 'servidor_jira.html';
    }
});

async function carregarServidoresComAlertas() {
    const container = document.querySelector('.servidores_alertas');
    if (!container) return;

    container.querySelectorAll('.servidor_card').forEach(c => c.remove());

    try {
        const resp = await fetch('/jira/buscaralertas');
        const alertas = await resp.json();

        const macsUnicos = [...new Set(alertas.map(a => a.description).filter(Boolean))];

        macsUnicos.forEach(mac => {
            const alertasServidor = alertas.filter(a => a.description === mac);

            const nomeServidor = `Servidor ${mac}`;

            let numHighest = 0, numMedium = 0;
            alertasServidor.forEach(a => {
                if (String(a.priority).toLowerCase() === "highest") numHighest++;
                if (String(a.priority).toLowerCase() === "medium") numMedium++;
            });

            let prioridade = "Medium";
            if (numHighest > numMedium) prioridade = "Highest";
            else if (numMedium > numHighest) prioridade = "Medium";
            else if (numHighest === numMedium && numHighest > 0) prioridade = "Highest";

            const prioridadeInfo = {
                Highest: { label: "Crítico", color: "#e53935" },
                Medium: { label: "Atenção", color: "#f7b116" }
            }[prioridade] || { label: prioridade, color: "#888" };

            const card = document.createElement('div');
            card.className = 'servidor_card';
            card.setAttribute('data-mac', mac);
            card.setAttribute('data-nome', nomeServidor);
            card.innerHTML = `
        <img src="./assets/imgs/servidor.png" alt="Servidor">
        <div class="info_servidor">
            <p class="nome">${nomeServidor}</p>
        </div>
        <div class="status_badge" style="color:${prioridadeInfo.color}; font-weight:800; margin-left: 350px;">
            ${prioridadeInfo.label}
        </div>
    `;
            container.appendChild(card);
        });

        if (macsUnicos.length === 0) {
            container.insertAdjacentHTML(
                "beforeend",
                `<div style="text-align:center;opacity:0.7;padding:32px;">Nenhum servidor em alerta.</div>`
            );
        }
    } catch (err) {
        console.error('Erro ao buscar alertas do bucket para cards de servidores', err);
        container.insertAdjacentHTML(
            "beforeend",
            `<div style="text-align:center;opacity:0.7;padding:32px;">Erro ao carregar servidores</div>`
        );
    }
}