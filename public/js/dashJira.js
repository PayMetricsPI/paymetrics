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

(function () {
  let chartInstance = null;

  function getComponentFromAlert(alert) {
    if (!alert) return '';
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

  function buildChartData(alertas) {
    const map = new Map();
    (alertas || []).forEach(a => {
      const comp = (getComponentFromAlert(a) || '').trim() || 'Sem componente';
      if (!map.has(comp)) map.set(comp, { aberto: 0, andamento: 0, fechado: 0 });
      const item = map.get(comp);
      const st = String(a.status || '').toLowerCase();
      if (st.includes('abert') || st.includes('open') || st.includes('todo')) item.aberto++;
      else if (st.includes('andamento') || st.includes('progress') || st.includes('doing') || st.includes('in progress')) item.andamento++;
      else if (st.includes('fech') || st.includes('done') || st.includes('closed') || st.includes('resolved')) item.fechado++;
      else item.aberto++;
    });

    const labels = Array.from(map.keys());
    const abertoData = labels.map(l => map.get(l).aberto);
    const andamentoData = labels.map(l => map.get(l).andamento);
    const fechadoData = labels.map(l => map.get(l).fechado);

    return {
      labels,
      datasets: [
        { label: 'Fechado', data: fechadoData, backgroundColor: '#43a047' },
        { label: 'Em Andamento', data: andamentoData, backgroundColor: '#f7b116' },
        { label: 'Aberto', data: abertoData, backgroundColor: '#1e88e5' }
      ]
    };
  }

  function createOrUpdateChart(alertas) {
    const canvas = document.getElementById('jiraChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = buildChartData(alertas);

    const config = {
      type: 'bar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: { mode: 'index', intersect: false }
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
        scales: {
          x: { stacked: true, ticks: { maxRotation: 0, minRotation: 0 } },
          y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    };

    if (chartInstance) {
      chartInstance.data = data;
      chartInstance.update();
    } else {
      chartInstance = new Chart(ctx, config);
    }
  }

  window.updateJiraChart = createOrUpdateChart;
})();