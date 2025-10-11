const usersDiv = document.querySelector('.users');
const fk_empresa = Number(sessionStorage.getItem('id'));

const out_create_server = document.getElementById('out_create_server');
const create_server_modal = document.getElementById('create_server_modal');
const close_create_server_button = document.getElementById('close_create_server_button');
const cancel_button_create_server = document.getElementById('cancel_button_create_server');
const submit_button_create_server = document.getElementById('submit_button_create_server');

const out_edit_server = document.getElementById('out_edit_server');
const edit_server_modal = document.getElementById('edit_server_modal');
const close_edit_server_button = document.getElementById('close_edit_server_button');
const cancel_button_edit_server = document.getElementById('cancel_button_edit_server');
const submit_button_edit_server = document.getElementById('submit_button_edit_server');

const out_delete_server = document.getElementById('out_delete_server');
const delete_server_modal = document.getElementById('delete_user_account_modal');
const close_delete_server_button = document.getElementById('close_delete_user_account_button');
const cancel_button_delete_server = document.getElementById('cancel_button_delete_user_account');
const confirm_button_delete_server = document.getElementById('confirm_button_delete_user');

let deleteServerID = null;


function open_modal_create_server() {
    out_create_server.classList.add('show');   
    create_server_modal.classList.add('show'); 
}

function close_modal_create_server() {
    out_create_server.classList.remove('show');
    create_server_modal.classList.remove('show');
    create_server_modal.querySelectorAll('input').forEach(i => i.value = '');
}


function open_modal_edit_server(id, nome, mac, tipo_cpu, ram, disco) {
    out_edit_server.classList.add('show');   
    edit_server_modal.classList.add('show');  
    edit_server_modal.querySelector('.nome_input').value = nome;
    edit_server_modal.querySelector('.mac_input').value = mac;
    edit_server_modal.querySelector('.tipo_cpu_input').value = tipo_cpu;
    edit_server_modal.setAttribute('idServidor', id);
    edit_server_modal.querySelector('.ram_input').value = ram;   
    edit_server_modal.querySelector('.disco_input').value = disco; 
}

function close_modal_edit_server() {
    out_edit_server.classList.remove('show');
    edit_server_modal.classList.remove('show');
    edit_server_modal.removeAttribute('idServidor');
}

function open_modal_delete_server(id) {
    deleteServerID = id;
    out_delete_server.classList.add('show');
    delete_server_modal.classList.add('show');
}

function close_modal_delete_server() {
    deleteServerID = null;
    out_delete_server.classList.remove('show');
    delete_server_modal.classList.remove('show');
}


document.getElementById('create_server_button_empresa').addEventListener('click', open_modal_create_server);
close_create_server_button.addEventListener('click', close_modal_create_server);
cancel_button_create_server.addEventListener('click', close_modal_create_server);
submit_button_create_server.addEventListener('click', () => {
    const nome = create_server_modal.querySelector('.nome_input').value.trim();
    const mac = create_server_modal.querySelector('.mac_input').value.trim();
    const tipo_cpu = create_server_modal.querySelector('.tipo_cpu_input').value.trim();
    const ram = create_server_modal.querySelector('.ram_input').value.trim();
    const disco = create_server_modal.querySelector('.disco_input').value.trim();
    if (!nome || !mac || !ram || !tipo_cpu || !disco) return alert("Preencha todos os campos!");
    fetch(`/servidores/criarServidor`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servidores: [{ fk_empresa, nome, mac_address: mac,tipo_cpu , disco, ram}] })
    }).then(resp => resp.json())
      .then(() => { close_modal_create_server(); carregarServidores(); })
      .catch(console.error);
});

close_edit_server_button.addEventListener('click', close_modal_edit_server);
cancel_button_edit_server.addEventListener('click', close_modal_edit_server);
submit_button_edit_server.addEventListener('click', () => {
    const id = edit_server_modal.getAttribute('idServidor');
    const nome = edit_server_modal.querySelector('.nome_input').value.trim();
    const mac = edit_server_modal.querySelector('.mac_input').value.trim();
    const tipo_cpu = edit_server_modal.querySelector('.tipo_cpu_input').value.trim();
    const ram = edit_server_modal.querySelector('.ram_input').value.trim();
    const disco = edit_server_modal.querySelector('.disco_input').value.trim();
    if (!nome || !mac || !tipo_cpu || !ram || !disco) return alert("Preencha todos os campos!");
    fetch(`/servidores/atualizarServidor/${id}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, mac_address: mac,tipo_cpu , ram, disco })
    }).then(resp => resp.json())
      .then(() => { close_modal_edit_server(); carregarServidores(); })
      .catch(console.error);
});

close_delete_server_button.addEventListener('click', close_modal_delete_server);
cancel_button_delete_server.addEventListener('click', close_modal_delete_server);
confirm_button_delete_server.addEventListener('click', () => {
    if (!deleteServerID) return alert("ID do servidor não definido!");
    fetch(`/servidores/deletarServidor/${deleteServerID}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fk_empresa })
    }).then(resp => resp.json())
      .then(() => { close_modal_delete_server(); carregarServidores(); })
      .catch(console.error);
});


function carregarServidores() {
    if (!fk_empresa) return;

    fetch(`/servidores/${fk_empresa}`)
        .then(resp => resp.json())
        .then(servidores => {
            usersDiv.innerHTML = '';
            servidores.forEach(s => {
                const div = document.createElement('div');
                div.className = 'users_container';
                div.innerHTML = `
                  <div class="user_icon">
                    <img src="./assets/icons/servidor_.png" width="90px">
                    </div>
                    <div class="user_info">
                    <p class="server_name" style="color:red;"> <strong>${s.nome}</strong> </p>
                    <p class="server_so"> <strong>Mac Adress: </strong> ${s.mac_address} </p>
                    <p class="server_tipo_cpu"> <strong>Modelo da cpu:</strong> ${s.tipo_cpu} </p>
                    <p class="server_ram"> <strong>Ram Gb: </strong> ${s.ram} </p>
                    <p class="server_disco"> <strong>Disco Tb: </strong> ${s.disco} </p>
                    
                    <div class="user_controls">
                        <button class="edit_user_button">Editar</button>
                        <button class="delete_user_button">Excluir</button>
                    </div>
                `;
                usersDiv.appendChild(div);
                div.querySelector('.edit_user_button').addEventListener('click', () =>
                    open_modal_edit_server(s.id_servidor, s.nome, s.mac_address, s.tipo_cpu, s.ram, s.disco)
                );
                div.querySelector('.delete_user_button').addEventListener('click', () =>
                    open_modal_delete_server(s.id_servidor)
                );
            });
        })
        .catch(console.error);
}
window.onload = carregarServidores;
