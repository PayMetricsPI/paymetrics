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