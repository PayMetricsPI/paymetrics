(function () {
    const STORAGE_KEY = 'tickets_fechados';
    const CLOSED_COLOR = '#43a047';
    const HIGHEST_COLOR = '#e53935';
    const MEDIUM_COLOR = '#f7b116';

    function readClosedList() {
        try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]'); }
        catch (e) { return []; }
    }
    function saveClosedList(list) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    const select = document.querySelector('.titulo_cha select, select#filtroStatus, select[name="status"], select') || null;
    const container = document.querySelector('.tickets, .servidores_alertas') || document.body;

    function normalizeStatus(s) {
        if (!s) return '';
        s = String(s).toLowerCase().trim();
        if (s.includes('abert') || s === 'open') return 'aberto';
        if (s.includes('and') || s.includes('andamento') || s === 'inprogress' || s === 'doing') return 'andamento';
        if (s.includes('fech') || s === 'closed' || s === 'done') return 'fechado';
        return s;
    }

    function getCards() {
        return Array.from(document.querySelectorAll('.card_ticket'));
    }

    function mapPriorityToColorLabel(p) {
        if (!p) return { label: 'Crítico', color: HIGHEST_COLOR };
        const v = String(p).toLowerCase();
        if (v === 'highest' || v === 'high') return { label: 'Highest', color: HIGHEST_COLOR };
        if (v === 'medium') return { label: 'Medium', color: MEDIUM_COLOR };
        return { label: String(p), color: HIGHEST_COLOR };
    }

    function applyFilter() {
        const filtroRaw = select?.value || '';
        const filtro = normalizeStatus(filtroRaw) || 'aberto';
        const closedList = readClosedList();

        const areaContainer = document.querySelector(`[data-area="${filtro}"]`);
        const allAreaContainers = Array.from(document.querySelectorAll('[data-area]'));

        if (allAreaContainers.length > 0) {
            allAreaContainers.forEach(a => {
                a.style.display = (a.getAttribute('data-area') === filtro) ? '' : 'none';
            });
        }

        getCards().forEach(card => {
            const dsStatus = card.dataset.status || card.getAttribute('data-status') || '';
            let status = normalizeStatus(dsStatus);
            if (!status) {
                const statusTextEl = card.querySelector('.status, .status_badge, .status_text');
                status = normalizeStatus(statusTextEl?.textContent || '');
            }

            const cardId = card.dataset.id || card.getAttribute('data-id') || null;
            if (cardId && closedList.indexOf(String(cardId)) !== -1) status = 'fechado';

            if (areaContainer) {
                if (status === filtro) {
                    areaContainer.appendChild(card);
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            } else {
                card.style.display = (filtro === status) ? '' : 'none';
            }

            const checkbox = card.querySelector('input[type="checkbox"], .ticket-checkbox');
            if (checkbox) {
                if (status === 'fechado') {
                    checkbox.checked = false;
                    checkbox.style.display = 'none';
                    checkbox.disabled = true;
                } else {
                    checkbox.style.display = '';
                    checkbox.disabled = false;
                }
            }

            const statusBadge = card.querySelector('.status_badge, .status');
            if (statusBadge) {
                if (status === 'fechado') {
                    statusBadge.textContent = 'Fechado';
                    statusBadge.style.color = CLOSED_COLOR;
                } else if (status === 'andamento') {
                    statusBadge.textContent = 'Em andamento';
                    statusBadge.style.color = MEDIUM_COLOR;
                } else {
                    const prioridadeAttr = card.dataset.priority || card.getAttribute('data-priority') || '';
                    const pInfo = mapPriorityToColorLabel(prioridadeAttr);
                    statusBadge.textContent = pInfo.label || 'Crítico';
                    statusBadge.style.color = pInfo.color;
                }
            }

            const statusText = card.querySelector('.lado_dir .status_text, .status_text');
            if (statusText) statusText.innerHTML = `<strong>Status:</strong> ${status === 'fechado' ? 'Fechado' : (status === 'andamento' ? 'Em andamento' : 'Aberto')}`;
        });
    }

    function markCardAsClosed(card) {
        if (!card) return;
        const cardId = card.dataset.id || card.getAttribute('data-id') || null;
        card.dataset.status = 'fechado';
        const badge = card.querySelector('.status_badge, .status');
        if (badge) {
            badge.textContent = 'Fechado';
            badge.style.color = CLOSED_COLOR;
        }
        const statusText = card.querySelector('.lado_dir .status_text, .status_text');
        if (statusText) statusText.innerHTML = '<strong>Status:</strong> Fechado';
        const checkbox = card.querySelector('input[type="checkbox"], .ticket-checkbox');
        if (checkbox) {
            checkbox.checked = false;
            checkbox.style.display = 'none';
            checkbox.disabled = true;
        }
        if (cardId) {
            const closedList = readClosedList();
            if (closedList.indexOf(String(cardId)) === -1) {
                closedList.push(String(cardId));
                saveClosedList(closedList);
            }
        }
    }

    container.addEventListener('click', (e) => {
        const target = e.target;
        if (!target.matches('input[type="checkbox"], .ticket-checkbox')) return;

        const card = target.closest('.card_ticket');
        if (!card) return;

        const filtroRaw = select?.value || '';
        const filtro = normalizeStatus(filtroRaw) || 'aberto';
        if (filtro === 'fechado') {
            target.checked = false;
            target.disabled = true;
            return;
        }

        markCardAsClosed(card);
        if (filtro !== 'fechado') {
            card.style.display = 'none';
        }
    });

    if (select) select.addEventListener('change', applyFilter);

    document.addEventListener('DOMContentLoaded', applyFilter);
    applyFilter();
})();