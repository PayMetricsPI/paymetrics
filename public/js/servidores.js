  const usersDiv = document.querySelector('.users');
  const fk_empresa = Number(sessionStorage.getItem('id'));

  const out_create_alerta_critico = document.getElementById('out_create_alerta_critico');
  const create_alerta_critico_modal = document.getElementById('create_alerta_critico_modal');

  const out_create_server = document.getElementById('out_create_server');
  const create_server_modal = document.getElementById('create_server_modal');
  const close_create_server_button = document.getElementById('close_create_server_button');
  const cancel_button_create_server = document.getElementById('cancel_button_create_server');
  const submit_button_create_server = document.getElementById('submit_button_create_server');

  const estadosPorPais = {
    BR: ["SP", "RJ", "MG", "BA", "RS", "SC", "PR", "PE"],
    US: ["CA", "TX", "FL", "NY"],
    CA: ["ON", "QC", "BC"],
    FR: ["IDF", "PAC", "NOR"],
    JP: ["TYO", "OSA", "KYT"]
  };

  const idSelect = document.getElementById("select_pais");
  const selectEstado = document.getElementById("select_estado");

  if (idSelect && selectEstado) {
    idSelect.addEventListener("change", () => {
      const paisSelecionado = idSelect.value;
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

  document.getElementById('create_server_button_empresa')?.addEventListener('click', open_modal_create_server);
  close_create_server_button?.addEventListener('click', close_modal_create_server);
  cancel_button_create_server?.addEventListener('click', close_modal_create_server);

  submit_button_create_server?.addEventListener('click', () => {
    const nome = create_server_modal.querySelector('.nome_input').value.trim();
    const pais = create_server_modal.querySelector('.pais_input').value.trim();
    const estado = create_server_modal.querySelector('.estado_input').value.trim();
    const mac = create_server_modal.querySelector('.mac_input').value.trim();
    const ipEc2 = create_server_modal.querySelector('.ipEc2_input').value.trim();
    const tipo_cpu = create_server_modal.querySelector('.tipo_cpu_input').value.trim();
    const ram = create_server_modal.querySelector('.ram_input').value.trim();
    const disco = create_server_modal.querySelector('.disco_input').value.trim();

    if (!nome || !mac || !tipo_cpu || !ram || !disco) return alert("Preencha todos os campos!");

    fetch(`/servidores/criarServidor`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fk_empresa, nome, pais, estado, mac_address: mac, ipEc2, tipo_cpu, ram, disco })
    })
      .then(resp => resp.json())
      .then((data) => {
        console.log("Resposta ao criar servidor:", data);
        close_modal_create_server();
        carregarServidores();
        console.log("criar servidor:", data.id_servidor);
        sessionStorage.setItem("fk_servidor", data.id_servidor);

        open_modal_create_alerta_critico(data.insertId);
      })
      .catch(console.error);
  });

  function open_modal_edit_server(id, nome, pais, estado, mac, ipEc2, tipo_cpu, ram, disco) {
    out_edit_server.classList.add('show');
    edit_server_modal.classList.add('show');

    edit_server_modal.querySelector('.nome_input').value = nome;
    edit_server_modal.querySelector('.mac_input').value = mac;
    edit_server_modal.querySelector('.ipEc2_input').value = ipEc2;
    edit_server_modal.querySelector('.tipo_cpu_input').value = tipo_cpu;
    edit_server_modal.querySelector('.ram_input').value = ram;
    edit_server_modal.querySelector('.disco_input').value = disco;
    edit_server_modal.setAttribute('idServidor', id);

    const selectPaisEdit = document.getElementById("select_pais_edit");
    const selectEstadoEdit = document.getElementById("select_estado_edit");

    selectPaisEdit.value = pais;
    selectEstadoEdit.innerHTML = `<option value="">Selecione um estado</option>`;

    const estados = estadosPorPais[pais] || [];
    estados.forEach(est => {
      const op = document.createElement("option");
      op.value = est;
      op.textContent = est;
      selectEstadoEdit.appendChild(op);
    });

    selectEstadoEdit.value = estado;
  }

  function close_modal_edit_server() {
    out_edit_server.classList.remove('show');
    edit_server_modal.classList.remove('show');
    edit_server_modal.removeAttribute('idServidor');
  }

  close_edit_server_button?.addEventListener('click', close_modal_edit_server);
  cancel_button_edit_server?.addEventListener('click', close_modal_edit_server);

  submit_button_edit_server?.addEventListener('click', () => {
    const id = edit_server_modal.getAttribute('idServidor');
    const nome = edit_server_modal.querySelector('.nome_input').value.trim();
    const pais = document.getElementById("select_pais_edit").value.trim();
    const estado = document.getElementById("select_estado_edit").value.trim();
    const mac = edit_server_modal.querySelector('.mac_input').value.trim();
    const ipEc2 = edit_server_modal.querySelector('.ipEc2_input').value.trim();
    const tipo_cpu = edit_server_modal.querySelector('.tipo_cpu_input').value.trim();
    const ram = edit_server_modal.querySelector('.ram_input').value.trim();
    const disco = edit_server_modal.querySelector('.disco_input').value.trim();

    if (!nome || !mac || !tipo_cpu || !ram || !disco) return alert("Preencha todos os campos!");

    fetch(`/servidores/atualizarServidor/${id}`, {
      method: 'PUT',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, pais, estado, mac_address: mac, ipEc2, tipo_cpu, ram, disco })
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

  close_delete_server_button?.addEventListener('click', close_modal_delete_server);
  cancel_button_delete_server?.addEventListener('click', close_modal_delete_server);

  confirm_button_delete_server?.addEventListener('click', () => {
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
          <div class="user_icon">
            <img src="./assets/icons/servidor_.png" width="90px">
          </div>
          <div class="user_info">
            <p><strong>Nome:</strong>  ${s.nome}</p>
            <p><strong>IP:</strong> ${s.ipEc2}</p>
            <p><strong>Mac Address:</strong> ${s.mac_address}</p>
            <p><strong>País:</strong> ${s.pais}</p>
            <p><strong>Estado:</strong> ${s.estado}</p>
            <p><strong>Modelo da CPU:</strong> ${s.tipo_cpu}</p>
            <p><strong>RAM (GB):</strong> ${s.ram}</p>
            <p><strong>Disco (TB):</strong> ${s.disco}</p>
          </div>
          `;

          if (sessionStorage.getItem("CARGO") === "Analista") {
            div.innerHTML += `
              <div class="user_controls">
                <button class="edit_user_button">Editar</button>
                <button class="edit_param_button" data-id="${s.id_servidor}">Editar parâmetros</button>
                <button class="delete_user_button">Excluir</button>
              </div>
            `;
          }

          div.addEventListener('click', (event) => {
            if (event.target.classList.contains('edit_user_button') || event.target.classList.contains('delete_user_button') || event.target.classList.contains('edit_param_button')) return;
            sessionStorage.setItem('servidorSelecionado', JSON.stringify(s));
            window.location.href = 'servidorDashboard.html';
          });

          usersDiv.appendChild(div);

          if (sessionStorage.getItem("CARGO") === "Analista") {
            const btnEditar = div.querySelector('.edit_user_button');
            const btnExcluir = div.querySelector('.delete_user_button');
            const btnParam = div.querySelector('.edit_param_button');

            btnEditar.addEventListener('click', (e) => {
              e.stopPropagation();
              open_modal_edit_server(
                s.id_servidor,
                s.nome,
                s.pais,
                s.estado,
                s.mac_address,
                s.ipEc2,
                s.tipo_cpu,
                s.ram,
                s.disco
              );
            });

            btnExcluir.addEventListener('click', (e) => {
              e.stopPropagation();
              open_modal_delete_server(s.id_servidor);
            });

            btnParam.addEventListener('click', async (e) => {
              e.stopPropagation();
                sessionStorage.setItem("fk_servidor", s.id_servidor);
              const parametros = await buscarParametrosServidor(s.id_servidor);
              console.log(parametros)
              abrirModalEditarParametros(parametros, s.id_servidor);
            });
          }
        });
      })
      .catch(console.error);
  }

  async function buscarParametrosServidor(idServidor) {
   try {
 
   const resp = await fetch(`/parametro/${idServidor}`);
   if (!resp.ok) {

   console.error(`Erro HTTP ao buscar parâmetros: ${resp.status}`);
  return [];
  }
  
  return await resp.json();
   } catch (e) {
    console.error("Erro ao buscar parâmetros:", e);
    return [];
   }
  }



  const out_edit_alerta_critico = document.getElementById('out_edit_alerta_critico');
  const edit_alerta_critico_modal = document.getElementById('edit_alerta_critico_modal');
  const close_edit_alerta_critico_button = document.getElementById('close_edit_alerta_critico_button');
  const cancel_button_edit_alerta_critico = document.getElementById('cancel_button_edit_alerta_critico');
  const submit_button_edit_alerta_critico = document.getElementById('submit_button_edit_alerta_critico');


 
  function fecharModalEditarParametros() {
   const modal = document.getElementById("edit_alerta_critico_modal");
   const fundo = document.getElementById("out_edit_alerta_critico");

   fundo.classList.remove("show");
   modal.classList.remove("show");
   
   modal.querySelectorAll('input').forEach(i => i.value = '');
   modal.removeAttribute('data-id-servidor'); 
  }


  function salvarParametrosEditados() {
   const idServidor = edit_alerta_critico_modal.getAttribute('data-id-servidor');
   if (!idServidor) return alert("ID do servidor não encontrado para salvar os parâmetros.");

   const inputs = edit_alerta_critico_modal.querySelectorAll('input.alerta_critico_input, input.alerta_normal_input');
   const novosParametros = [];

  inputs.forEach(input => {
    const valor = input.value.trim();
    if (valor !== "") {
     novosParametros.push({
    fk_componente: Number(input.getAttribute('data-componente')),
   tipo: input.getAttribute('data-tipo'),
   valor: Number(valor)
   });
}
   });

   if (novosParametros.length === 0) return alert("Preencha pelo menos um campo para salvar!");


   fetch(`/parametro/atualizarParametros/${idServidor}`, {
   method: 'PUT', 
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ parametros: novosParametros })
   })
   .then(resp => {
    if (resp.ok) {
     alert("Parâmetros salvos com sucesso!"); 
      fecharModalEditarParametros();
 
    } else {
     alert("Erro ao salvar os parâmetros. Verifique o servidor.");
    }
   })
   .catch(e => {
    console.error("Erro na requisição de atualização de parâmetros:", e);
    alert("Ocorreu um erro de rede ou servidor ao salvar os parâmetros.");
   });
  }

  submit_button_edit_alerta_critico?.addEventListener('click', salvarParametrosEditados);

  
  close_edit_alerta_critico_button?.addEventListener('click', fecharModalEditarParametros);
  cancel_button_edit_alerta_critico?.addEventListener('click', fecharModalEditarParametros);

  function abrirModalEditarParametros(parametros, idServidor) {
   const modal = document.getElementById("edit_alerta_critico_modal");
   const fundo = document.getElementById("out_edit_alerta_critico");

   fundo.classList.add("show");
   modal.classList.add("show");

 
   modal.setAttribute('data-id-servidor', idServidor);


   modal.querySelectorAll('input').forEach(i => i.value = '');

 
   parametros.forEach(p => {
    const inputNormal = modal.querySelector(`input[data-componente="${p.fk_componente}"][data-tipo="normal"]`);
    const inputCritico = modal.querySelector(`input[data-componente="${p.fk_componente}"][data-tipo="critico"]`);
  
    if (inputNormal) inputNormal.value = p.alerta_normal; 
    if (inputCritico) inputCritico.value = p.alerta_critico; 
   });
  }
  window.onload = carregarServidores;
