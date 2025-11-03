const usersDiv = document.querySelector('.users');
const fk_servidor = Number(sessionStorage.getItem('fk_servidor'));
const fk_empresa = Number(sessionStorage.getItem('fk_empresa'));
const fk_componente = Number(sessionStorage.getItem('fk_componente'));

const out_create_alerta_critico = document.getElementById('out_create_alerta_critico');
const create_alerta_critico_modal = document.getElementById('create_alerta_critico_modal');
const close_create_alerta_critico_button = document.getElementById('close_create_alerta_critico_button');
const cancel_button_create_alerta_critico = document.getElementById('cancel_button_create_alerta_critico');
const submit_button_create_alerta_critico = document.getElementById('submit_button_create_alerta_critico');

const out_edit_alerta_critico = document.getElementById('out_edit_alerta_critico');
const edit_alerta_critico_modal = document.getElementById('edit_alerta_critico_modal');
const close_edit_alerta_critico_button = document.getElementById('close_edit_alerta_critico_button');
const cancel_button_edit_alerta_critico = document.getElementById('cancel_button_edit_alerta_critico');
const submit_button_edit_alerta_critico = document.getElementById('submit_button_edit_alerta_critico');

let deletPaalerta_criticoetroID = null;

function open_modal_create_alerta_critico(id) {
    out_create_alerta_critico.classList.add('show');
    create_alerta_critico_modal.setAttribute("fk_servidor", id);
    create_alerta_critico_modal.classList.add('show');
}

function close_modal_create_alerta_critico() {
    out_create_alerta_critico.classList.remove('show');
    create_alerta_critico_modal.classList.remove('show');
    create_alerta_critico_modal.querySelectorAll('input').forEach(i => i.value = '');
}

if (close_create_alerta_critico_button) {
    close_create_alerta_critico_button.addEventListener('click', close_modal_create_alerta_critico);
}
if (cancel_button_create_alerta_critico) {
    cancel_button_create_alerta_critico.addEventListener('click', close_modal_create_alerta_critico);
}

function open_modal_edit_alerta_critico(id, alerta_critico, alerta_normal) {
    out_edit_alerta_critico.classList.add('show');
    edit_alerta_critico_modal.classList.add('show');
    edit_alerta_critico_modal.setAttribute('id_parametro', id);
    edit_alerta_critico_modal.querySelector('.alerta_critico_input').value = alerta_critico;
    edit_alerta_critico_modal.querySelector('.alerta_normal_input').value = alerta_normal;
}

function close_modal_edit_alerta_critico() {
    out_edit_alerta_critico.classList.remove('show');
    edit_alerta_critico_modal.classList.remove('show');
    edit_alerta_critico_modal.removeAttribute('id_parametro');
}

// function carregarParametro() {
//     return Promise.resolve();
// }

// document.getElementById('create_alerta_critico_button_empresa').addEventListener('click', open_modal_create_alerta_critico);
close_create_alerta_critico_button.addEventListener('click', close_modal_create_alerta_critico);
cancel_button_create_alerta_critico.addEventListener('click', close_modal_create_alerta_critico);
submit_button_create_alerta_critico.addEventListener('click', () => {
    const fk_servidor = create_alerta_critico_modal.getAttribute('fk_servidor');
    const fk_empresa = Number(sessionStorage.getItem('fk_empresa'));

    const parametros = [];

    const cpuCritico = document.querySelector('input[data-componente="1"][data-tipo="critico"]').value;
    const cpuNormal = document.querySelector('input[data-componente="1"][data-tipo="normal"]').value;

    parametros.push({
        fk_servidor,
        fk_empresa,
        fk_componente: 1,
        alerta_critico: Number(cpuCritico),
        alerta_normal: Number(cpuNormal)
    });

    const ramCritico = document.querySelector('input[data-componente="2"][data-tipo="critico"]').value;
    const ramNormal = document.querySelector('input[data-componente="2"][data-tipo="normal"]').value;
    parametros.push({
        fk_servidor,
        fk_empresa,
        fk_componente: 2,
        alerta_critico: Number(ramCritico),
        alerta_normal: Number(ramNormal)
    });

    const discoCritico = document.querySelector('input[data-componente="5"][data-tipo="critico"]').value;
    const discoNormal = document.querySelector('input[data-componente="5"][data-tipo="normal"]').value;
    parametros.push({
        fk_servidor,
        fk_empresa,
        fk_componente:5,
        alerta_critico: Number(discoCritico),
        alerta_normal: Number(discoNormal)
    });

    const enviadosCritico = document.querySelector('input[data-componente="3"][data-tipo="critico"]').value;
    const enviadosNormal = document.querySelector('input[data-componente="3"][data-tipo="normal"]').value;
    parametros.push({
        fk_servidor,
        fk_empresa,
        fk_componente: 3,
        alerta_critico: Number(enviadosCritico),
        alerta_normal: Number(enviadosNormal)
    });

    const recebidosCritico = document.querySelector('input[data-componente="4"][data-tipo="critico"]').value;
    const recebidosNormal = document.querySelector('input[data-componente="4"][data-tipo="normal"]').value;
    parametros.push({
        fk_servidor,
        fk_empresa,
        fk_componente: 4,
        alerta_critico: Number(recebidosCritico),
        alerta_normal: Number(recebidosNormal)
    });


    fetch('/parametro/criarParametro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parametros })
    })
        .then(response => response.json())
        .then(data => {
            close_modal_create_alerta_critico();
        })
});

close_edit_alerta_critico_button.addEventListener('click', close_modal_edit_alerta_critico);
cancel_button_edit_alerta_critico.addEventListener('click', close_modal_edit_alerta_critico);
submit_button_edit_alerta_critico.addEventListener('click', () => {
    const id = edit_alerta_critico_modal.getAttribute('id_parametro');
    const alerta_critico = edit_alerta_critico_modal.querySelector('.alerta_critico_input').value.trim();
    const alerta_normal = edit_alerta_critico_modal.querySelector('.alerta_normal_input').value.trim();
    if (!alerta_critico || !alerta_normal) return alert("Preencha todos os campos!");
    fetch(`/parametro/atualizarParametro/${id}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alerta_critico, alerta_normal })
    }).then(resp => resp.json())
        .then(() => { close_modal_edit_alerta_critico(); carregarParametro(); })
        .catch(console.error);
});

