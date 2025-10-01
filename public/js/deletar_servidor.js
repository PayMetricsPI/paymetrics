const out_delete_server = document.getElementById('out_delete_server');
const close_delete_server_button = document.getElementById('close_delete_user_account_button');
const delete_server_modal = document.getElementById('delete_user_account_modal');
const cancel_button_delete_server = document.getElementById('cancel_button_delete_user_account');
const confirm_button_delete_server = document.getElementById('confirm_button_delete_user');

const delete_server_buttons = document.querySelectorAll('.delete_user_button');

// Fechar modal
const close_modal_delete_server = () => {
    out_delete_server.style.visibility = 'hidden';
    delete_server_modal.style.visibility = 'hidden';
    out_delete_server.style.pointerEvents = 'none';
    delete_server_modal.style.pointerEvents = 'none';
    out_delete_server.style.opacity = 0;
    delete_server_modal.style.opacity = 0;
    delete_server_modal.removeAttribute('idServidor');
}

// Abrir modal
const open_modal_delete_server = (serverID) => {
    out_delete_server.style.visibility = 'visible';
    delete_server_modal.style.visibility = 'visible';
    out_delete_server.style.pointerEvents = 'auto';
    delete_server_modal.style.pointerEvents = 'auto';
    out_delete_server.style.opacity = 1;
    delete_server_modal.style.opacity = 1;
    delete_server_modal.setAttribute('idServidor', serverID);
}

// Associa os botões de excluir ao modal
delete_server_buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const container = e.target.closest('.users_container');
        const serverIdDeleted = container.getAttribute('idServidor'); 
        open_modal_delete_server(serverIdDeleted);
    });
});

// Enviar DELETE para o backend
const sendDeleteServer = () => {
    const serverID = delete_server_modal.getAttribute('idServidor');

    fetch(`/servidores/deletarServidor/${serverID}`, {
        method: 'DELETE',
    }).then(response => {
        if (response.status === 200) {
            window.location.reload();
        } else {
            alert("Erro ao excluir servidor!");
        }
    });
}

// Eventos de fechar/cancelar
out_delete_server.addEventListener('click', close_modal_delete_server);
close_delete_server_button.addEventListener('click', close_modal_delete_server);
cancel_button_delete_server.addEventListener('click', close_modal_delete_server);

// Confirmar exclusão
confirm_button_delete_server.addEventListener('click', sendDeleteServer);
