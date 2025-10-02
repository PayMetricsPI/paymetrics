const out_edit_server = document.getElementById('out_edit_server');
const edit_server_modal = document.getElementById('edit_server_modal');
const close_edit_server_button = document.getElementById('close_edit_server_button');
const cancel_button_edit_server = document.getElementById('cancel_button_edit_server');
const submit_button_edit_server = document.getElementById('submit_button_edit_server');

function open_modal_edit_server(id, nome, so, mac) {
    out_edit_server.style.display = 'block';
    edit_server_modal.style.display = 'block';

    edit_server_modal.querySelector('.nome_input').value = nome;
    edit_server_modal.querySelector('.so_input').value = so;
    edit_server_modal.querySelector('.mac_input').value = mac;

    edit_server_modal.setAttribute('idServidor', id);
}

function close_modal_edit_server() {
    out_edit_server.style.display = 'none';
    edit_server_modal.style.display = 'none';
    edit_server_modal.removeAttribute('idServidor');
}

function sendEditServer() {
    const id = edit_server_modal.getAttribute('idServidor');
    const nome = edit_server_modal.querySelector('.nome_input').value;
    const so = edit_server_modal.querySelector('.so_input').value;
    const mac = edit_server_modal.querySelector('.mac_input').value;

    if (!nome || !so || !mac) {
        alert("Preencha todos os campos!");
        return;
    }

    fetch(`/servidores/atualizarServidor/${id}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, sistema_operacional: so, mac_address: mac })
    })
    .then(resp => {
        if (resp.ok) {
            carregarServidores();
            close_modal_edit_server();
        } else {
            alert("Erro ao atualizar servidor!");
        }
    })
    .catch(err => console.error(err));
}


function deleteServer(id) {
    const fk_empresa = sessionStorage.getItem('id');
    if (!fk_empresa) return;

    fetch(`/servidores/deletarServidor/${id}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fk_empresa })
    })
    .then(resp => {
        if (resp.ok) carregarServidores();
        else alert("Erro ao deletar servidor!");
    })
    .catch(err => console.error(err));
}

function carregarServidores() {
    const fk_empresa = sessionStorage.getItem('id');

    if (!fk_empresa) {
        alert("ID da empresa não encontrado. Faça login novamente.");
        return;
    }
    
    fetch(`/servidores/${fk_empresa}`)
    .then(resp => resp.json())
    .then(servidores => {
        const usersDiv = document.querySelector('.users');
        usersDiv.innerHTML = '';

        servidores.forEach(s => {
            const div = document.createElement('div');
            div.className = 'users_container';
            div.innerHTML = `
                  <img src="./assets/icons/servidor_.png" width="90px">
                    <div class="user_info">
                    <p class="server_name">${s.nome}</p>
                    <p class="server_so">${s.sistema_operacional}</p>
                    <p class="server_mac">${s.mac_address}</p>
                </div>
                <div class="user_controls">
                    <button class="edit_user_button">Editar</button>
                    <button class="delete_user_button">Excluir</button>
                </div>
                </div>
            `;
            usersDiv.appendChild(div);
            div.querySelector('.edit_user_button').addEventListener('click', () => {
                open_modal_edit_server(s.id_servidor, s.nome, s.sistema_operacional, s.mac_address);
            });
            div.querySelector('.delete_user_button').addEventListener('click', () => {
                if (confirm("Deseja realmente excluir este servidor?")) {
                    deleteServer(s.id_servidor);
                }
            });
        });
    })
    .catch(err => console.error(err));
}

close_edit_server_button.addEventListener('click', close_modal_edit_server);
cancel_button_edit_server.addEventListener('click', close_modal_edit_server);
out_edit_server.addEventListener('click', close_modal_edit_server);
submit_button_edit_server.addEventListener('click', sendEditServer);

window.onload = carregarServidores;
