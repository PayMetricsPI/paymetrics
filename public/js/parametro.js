const usersDiv = document.querySelector('.users');
const fk_empresa = Number(sessionStorage.getItem('id'));

const out_create_alerta_critico = document.getElementById('out_create_alerta_critico');
const create_alerta_critico_alerta_critico = document.getElementById('create_alerta_critico_modal');
const close_create_alerta_critico_button = document.getElementById('close_create_alerta_critico_button');
const cancel_button_create_alerta_critico = document.getElementById('cancel_button_create_alerta_critico');
const submit_button_create_alerta_critico = document.getElementById('submit_button_create_alerta_critico');

const out_edit_alerta_critico = document.getElementById('out_edit_alerta_critico');
const edit_alerta_critico_modal = document.getElementById('edit_alerta_critico_modal');
const close_edit_alerta_critico_button = document.getElementById('close_edit_alerta_critico_button');
const cancel_button_edit_alerta_critico = document.getElementById('cancel_button_edit_alerta_critico');
const submit_button_edit_alerta_critico = document.getElementById('submit_button_edit_alerta_critico');

let deletPaalerta_criticoetroID = null;

function open_modal_create_alerta_critico() {
    out_create_alerta_critico.classList.add('show');   
    create_alerta_critico_modal.classList.add('show'); 
}

function close_modal_create_alerta_critico() {
    out_create_alerta_critico.classList.remove('show');
    create_alerta_critico_modal.classList.remove('show');
    create_alerta_critico_modal.querySelectorAll('input').forEach(i => i.value = '');
}

function open_modal_edit_alerta_critico(id, fk_componente, fk_empresa, fk_componente, alerta_critico, alerta_normal) {
    out_edit_alerta_critico.classList.add('show');   
    edit_alerta_critico_modal.classList.add('show');  
    edit_alerta_critico_modal.querySelector('.fk_servidor_input').value = fk_componente;
    edit_alerta_critico_modal.querySelector('.fk_empresa_input').value = fk_empresa;
    edit_alerta_critico_modal.querySelector('.fk_componente_input').value = fk_componente;
    edit_alerta_critico_modal.setAttribute('idServidor', id);
    edit_alerta_critico_modal.querySelector('.alerta_critico_input').value = alerta_critico;   
    edit_alerta_critico_modal.querySelector('.alerta_normal_input').value = alerta_normal; 
}

function close_modal_edit_alerta_criticoetro() {
    out_edit_alerta_critico.classList.remove('show');
    edit_alerta_critico_modal.classList.remove('show');
    edit_alerta_critico_modal.removeAttribute('idServidor');
}

document.getElementById('create_alerta_critico_button_empresa').addEventListener('click', open_modal_create_alerta_critico);
close_create_alerta_critico_button.addEventListener('click', close_modal_create_alerta_critico);
cancel_button_create_alerta_critico.addEventListener('click', close_modal_create_alerta_critico);
submit_button_create_alerta_critico.addEventListener('click', () => {
    const fk_servidor = create_alerta_critico_modal.querySelector('.fk_servidor_input').value.trim();
    const fk_empresa = create_alerta_critico_modal.querySelector('.fk_empresa_input').value.trim();
    const fk_componente = create_alerta_critico_modal.querySelector('.fk_componente_input').value.trim();
    const alerta_critico = create_alerta_critico_modal.querySelector('.r   am_input').value.trim();
    const alerta_normal = create_alerta_critico_modal.querySelector('.alerta_normal_input').value.trim();
    if (!fk_componente || !fk_empresa ||  !fk_componente ||!alerta_critico || !alerta_normal) return alert("Preencha todos os campos!");
    fetch(`/servidores/criarServidor`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servidores: [{ fk_servidor, fk_componente, fk_empresa, fk_componente , alerta_critico, alerta_normal}] })
    }).then(resp => resp.json())
      .then(() => { close_modal_create_alerta_critico(); carregarServidores(); })
      .catch(console.error);
});

close_edit_alerta_critico_button.addEventListener('click', close_modal_edit_alerta_critico);
cancel_button_edit_alerta_critico.addEventListener('click', close_modal_edit_alerta_critico);
submit_button_edit_alerta_critico.addEventListener('click', () => {
    const id = edit_alerta_critico_modal.getAttribute('idServidor');
    const fk_servidor = edit_alerta_critico_modal.querySelector('.fk_servidor_input').value.trim();
    const fk_empresa = edit_alerta_critico_modal.querySelector('.fk_empresa_input').value.trim();
    const fk_componente = edit_alerta_critico_modal.querySelector('.fk_componente_input').value.trim();
    const alerta_critico = edit_alerta_critico_modal.querySelector('.alerta_critico_input').value.trim();
    const alerta_normal = edit_alerta_critico_modal.querySelector('.alerta_normal_input').value.trim();
    if (!fk_servidor || !fk_empresa || !fk_componente || !alerta_critico || !alerta_normal) return alert("Preencha todos os campos!");
    fetch(`/servidores/atualizarServidor/${id}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fk_servidor, fk_empresa_address: fk_empresa,fk_componente , alerta_critico, alerta_normal })
    }).then(resp => resp.json())
      .then(() => { close_modal_edit_alerta_critico(); carregarServidores(); })
      .catch(console.error);
});

