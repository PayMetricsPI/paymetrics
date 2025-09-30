const create_server_button_servidor = document.getElementById('create_server_button_empresa');

const out_create_server = document.getElementById('out_create_server');
const create_server_modal = document.getElementById('create_server_modal');
const close_create_server_button = document.getElementById('close_create_server_button');
const cancel_button_create_server = document.getElementById('cancel_button_create_server');
const submit_button_create_server = document.getElementById('submit_button_create_server');

const open_modal_create_server = () => {
    out_create_server.style.visibility = 'visible';
    create_server_modal.style.visibility = 'visible';
    out_create_server.style.pointerEvents = 'auto';
    create_server_modal.style.pointerEvents = 'auto';
    out_create_server.style.opacity = 1;
    create_server_modal.style.opacity = 1;
}

const close_modal_create_server = () => {
    out_create_server.style.visibility = 'hidden';
    create_server_modal.style.visibility = 'hidden';
    out_create_server.style.pointerEvents = 'none';
    create_server_modal.style.pointerEvents = 'none';
    out_create_server.style.opacity = 0;
    create_server_modal.style.opacity = 0;
}

const sendCreateServerservidor = () => {
    const nome_input = document.querySelector('.create_server_content .nome_input');
    const so_input = document.querySelector('.create_server_content .so_input');
    const mac_input = document.querySelector('.create_server_content .mac_input');

    if (verifyFields([nome_input, so_input, mac_input])) {
        fetch('/servidores/cadastrarServidor/', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "nome": nome_input.value,
                "sistema_operacional": so_input.value,
                "mac_address": mac_input.value,
                "fkEmpresa": sessionStorage.getItem('id'),
            }),
        }).then(response => {
            if (response.status == 200) {
                window.location.reload()
            }
        })
    }
}

close_create_server_button.addEventListener('click', close_modal_create_server);
out_create_server.addEventListener('click', close_modal_create_server);
cancel_button_create_server.addEventListener('click', close_modal_create_server);
create_server_button_servidor.addEventListener('click', open_modal_create_server);
submit_button_create_server.addEventListener('click', sendCreateServerservidor);
