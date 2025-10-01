document.addEventListener('DOMContentLoaded', () => {
  const edit_user_button_locals = document.getElementsByClassName('edit_user_button');
  const out_edit_user = document.getElementById('out_edit_server');
  const edit_user_modal = document.getElementById('edit_server_modal');
  const close_edit_user_button = document.getElementById('close_edit_server_button');
  const cancel_button_edit_user = document.getElementById('cancel_button_edit_server');
  const submit_button_edit_user = document.getElementById('submit_button_edit_server');

  // Protege contra null
  if (!edit_user_modal || !out_edit_user) return;

  const open_modal_edit_user = (userID) => {
      out_edit_user.style.visibility = 'visible';
      edit_user_modal.style.visibility = 'visible';
      out_edit_user.style.pointerEvents = 'auto';
      edit_user_modal.style.pointerEvents = 'auto';
      out_edit_user.style.opacity = 1;
      edit_user_modal.style.opacity = 1;
      edit_user_modal.setAttribute('idServidor', userID);
  }

  const close_modal_edit_user = () => {
      out_edit_user.style.visibility = 'hidden';
      edit_user_modal.style.visibility = 'hidden';
      out_edit_user.style.pointerEvents = 'none';
      edit_user_modal.style.pointerEvents = 'none';
      out_edit_user.style.opacity = 0;
      edit_user_modal.style.opacity = 0;
      edit_user_modal.removeAttribute('idServidor');
  }

  // Conectar os botões de editar
  Array.from(edit_user_button_locals).forEach(btn => {
      btn.addEventListener('click', (e) => {
          const container = e.target.closest('.users_container');
          const serverID = container.getAttribute('idServidor');
          const serverName = container.querySelector('.server_name')?.innerText || '';
          const serverSO = container.querySelector('.server_so')?.innerText || '';
          const serverMac = container.querySelector('.server_mac')?.innerText || '';

          edit_server_modal.querySelector('.nome_input').value = serverName;
          edit_server_modal.querySelector('.so_input').value = serverSO;
          edit_server_modal.querySelector('.mac_input').value = serverMac;

          open_modal_edit_user(serverID);
      });
  });

  // Eventos fechar/cancelar
  close_edit_user_button?.addEventListener('click', close_modal_edit_user);
  out_edit_user?.addEventListener('click', close_modal_edit_user);
  cancel_button_edit_user?.addEventListener('click', close_modal_edit_user);

  // Confirmar edição
  submit_button_edit_user?.addEventListener('click', () => {
      const serverID = edit_user_modal.getAttribute('idServidor');
      const nome = edit_user_modal.querySelector('.nome_input').value;
      const so = edit_user_modal.querySelector('.so_input').value;
      const mac = edit_user_modal.querySelector('.mac_input').value;

      fetch(`/servidores/atualizarServidor/${serverID}`, {
          method: 'PUT',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, sistema_operacional: so, mac_address: mac }),
      }).then(res => {
          if (res.status === 200) window.location.reload();
          else alert('Erro ao atualizar servidor!');
      });
  });
});
