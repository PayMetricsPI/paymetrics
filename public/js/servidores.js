const usersDiv = document.querySelector('.users');
const fk_empresa = Number(sessionStorage.getItem('id'));

// import { open_modal_create_alerta_critico } from './parametro'

const out_create_alerta_critico = document.getElementById('out_create_alerta_critico');
const create_alerta_critico_modal = document.getElementById('create_alerta_critico_modal');

const out_create_server = document.getElementById('out_create_server');
const create_server_modal = document.getElementById('create_server_modal');
const close_create_server_button = document.getElementById('close_create_server_button');
const cancel_button_create_server = document.getElementById('cancel_button_create_server');
const submit_button_create_server = document.getElementById('submit_button_create_server');

const estadosPorPais = {
  BR: ["SP", "RJ", "MG", "BA", "RS", "SC", "PR", "PE"],
  US: ["California", "Texas", "Florida", "New York"],
  CA: ["Ontario", "Quebec", "British Columbia"],
  FR: ["Île-de-France", "Provence", "Normandia"],
  JP: ["Tóquio", "Osaka", "Kyoto"]
};

const selectPais = document.getElementById("select_pais");
const selectEstado = document.getElementById("select_estado");

if (selectPais && selectEstado) {
  selectPais.addEventListener("change", () => {
    const paisSelecionado = selectPais.value;

    
    selectEstado.innerHTML = `<option value="">Selecione um estado</option>`;

    if (!paisSelecionado) return;

  
    const estados = estadosPorPais[paisSelecionado] || [];

    estados.forEach(estado => {
      const op = document.createElement("option");
      op.value = estado;
      op.textContent = estado;
      selectEstado.appendChild(op);
    });
  });
}


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

document.getElementById('create_server_button_empresa').addEventListener('click', open_modal_create_server);
close_create_server_button.addEventListener('click', close_modal_create_server);
cancel_button_create_server.addEventListener('click', close_modal_create_server);

submit_button_create_server.addEventListener('click', () => {
  const nome = create_server_modal.querySelector('.nome_input').value.trim();
  const pais = create_server_modal.querySelector('.pais_input').value.trim();
  const estado = create_server_modal.querySelector('.estado_input').value.trim();
  const mac = create_server_modal.querySelector('.mac_input').value.trim();
  const tipo_cpu = create_server_modal.querySelector('.tipo_cpu_input').value.trim();
  const ram = create_server_modal.querySelector('.ram_input').value.trim();
  const disco = create_server_modal.querySelector('.disco_input').value.trim();

  if (!nome || !mac || !tipo_cpu || !ram || !disco)
    return alert("Preencha todos os campos!");

  fetch(`/servidores/criarServidor`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      servidores: [{ fk_empresa, nome, pais,estado, mac_address: mac, tipo_cpu, ram, disco }]
    })
  })
    .then(resp => resp.json())
    .then((data) => {
      close_modal_create_server();
      carregarServidores();
      console.log(data);
      if (out_create_alerta_critico && create_alerta_critico_modal) {
        open_modal_create_alerta_critico(data.insertId);
      }
    })
    .catch(console.error);
});


function open_modal_edit_server(id, nome, pais, estado, mac, tipo_cpu, ram, disco) {
  out_edit_server.classList.add('show');
  edit_server_modal.classList.add('show');

  edit_server_modal.querySelector('.nome_input').value = nome;
  edit_server_modal.querySelector('.mac_input').value = mac;
  edit_server_modal.querySelector('.tipo_cpu_input').value = tipo_cpu;
  edit_server_modal.querySelector('.ram_input').value = ram;
  edit_server_modal.querySelector('.disco_input').value = disco;
  edit_server_modal.setAttribute('idServidor', id);

  const selectPaisEdit = document.getElementById("select_pais_edit");
  const selectEstadoEdit = document.getElementById("select_estado_edit");

  // seta o país
  selectPaisEdit.value = pais;

  // carrega os estados do país selecionado
  selectEstadoEdit.innerHTML = `<option value="">Selecione um estado</option>`;
  const estados = estadosPorPais[pais] || [];

  estados.forEach(est => {
    const op = document.createElement("option");
    op.value = est;
    op.textContent = est;
    selectEstadoEdit.appendChild(op);
  });

  // seta o estado
  selectEstadoEdit.value = estado;
}

function close_modal_edit_server() {
  out_edit_server.classList.remove('show');
  edit_server_modal.classList.remove('show');
  edit_server_modal.removeAttribute('idServidor');
}

close_edit_server_button.addEventListener('click', close_modal_edit_server);
cancel_button_edit_server.addEventListener('click', close_modal_edit_server);

submit_button_edit_server.addEventListener('click', () => {
  const id = edit_server_modal.getAttribute('idServidor');
  const nome = edit_server_modal.querySelector('.nome_input').value.trim();
 const pais = document.getElementById("select_pais_edit").value.trim();
const estado = document.getElementById("select_estado_edit").value.trim();
  const mac = edit_server_modal.querySelector('.mac_input').value.trim();
  const tipo_cpu = edit_server_modal.querySelector('.tipo_cpu_input').value.trim();
  const ram = edit_server_modal.querySelector('.ram_input').value.trim();
  const disco = edit_server_modal.querySelector('.disco_input').value.trim();

  if (!nome || !mac || !tipo_cpu || !ram || !disco)
    return alert("Preencha todos os campos!");

  fetch(`/servidores/atualizarServidor/${id}`, {
    method: 'PUT',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, pais,estado,mac_address: mac, tipo_cpu, ram, disco })
  })
    .then(resp => resp.json())
    .then(() => {
      close_modal_edit_server();
      carregarServidores();
    })
    .catch(console.error);
});


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

close_delete_server_button.addEventListener('click', close_modal_delete_server);
cancel_button_delete_server.addEventListener('click', close_modal_delete_server);
confirm_button_delete_server.addEventListener('click', () => {
  if (!deleteServerID) return alert("ID do servidor não definido!");

  fetch(`/servidores/deletarServidor/${deleteServerID}`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fk_empresa })
  })
    .then(resp => resp.json())
    .then(() => {
      close_modal_delete_server();
      carregarServidores();
    })
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
        div.style.cursor = 'pointer';

        div.innerHTML = `
          <div class="user_icon" fk_servidor="${s.id}">
            <img src="./assets/icons/servidor_.png" width="90px">
          </div>
          <div class="user_info">
            <p class="server_name" style="color:red;"> <strong>${s.nome}</strong> </p>
            <p class="server_so"><strong>Mac Address:</strong> ${s.mac_address}</p>
            <p class="server_pais"><strong>País:</strong> ${s.pais}</p>
            <p class="server_pais"><Strong>Estado:</strong>${s.estado}</p>
            <p class="server_tipo_cpu"><strong>Modelo da CPU:</strong> ${s.tipo_cpu}</p>
            <p class="server_ram"><strong>RAM (GB):</strong> ${s.ram}</p>
            <p class="server_disco"><strong>Disco (TB):</strong> ${s.disco}</p>
        `;

        if (sessionStorage.getItem("CARGO") === "Analista") {
          div.innerHTML += `
            <div class="user_controls">
              <button class="edit_user_button">Editar</button>
              <button class="delete_user_button">Excluir</button>
            </div>`;
        }

        div.innerHTML += "</div>";

        div.addEventListener('click', (event) => {
          if (event.target.classList.contains('edit_user_button') || event.target.classList.contains('delete_user_button')) {
            return;
          }
          sessionStorage.setItem('servidorSelecionado', JSON.stringify(s));
          window.location.href = 'servidorDashboard.html';
        });

        usersDiv.appendChild(div);

     
        if (sessionStorage.getItem("CARGO") === "Analista") {
          div.querySelector('.edit_user_button').addEventListener('click', () =>
            open_modal_edit_server(s.id_servidor || s.id, s.nome, s.pais,s.estado, s.mac_address, s.tipo_cpu, s.ram, s.disco)
          );
          div.querySelector('.delete_user_button').addEventListener('click', () =>
            open_modal_delete_server(s.id_servidor || s.id)
          );
        }
      });
    })
    .catch(console.error);
}

window.onload = carregarServidores;
