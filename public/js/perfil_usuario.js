function loadInfosEmpresa() {
    const nome_empresa_local = document.getElementById('nome_usuario');
    const nome_empresa_edit_local = document.getElementById('nome_empresa_edit');
    const email_empresa_edit = document.getElementById('email_empresa_edit');

    nome_empresa_local.innerHTML = sessionStorage.getItem('nome');
    nome_empresa_edit_local.innerHTML = sessionStorage.getItem('nome');
    email_empresa_edit.innerHTML = sessionStorage.getItem('email');

}

function retornaTodosOsUsuariosDaEmpresa() {

    usuarioId = sessionStorage.getItem('id');
    empresaId = sessionStorage.getItem('fkEmpresa');

    fetch(`/usuarios/retornaTodosOsUsuariosDaEmpresa/${usuarioId}/${empresaId}`)
        .then(response => {
            response.json()
                .then(json => {
                    const users_container = document.getElementById('users_container');
                    console.log(json);
                    for (user of json) {
                        users_container.innerHTML += `
                            <div class="user" idUser="${user.id}">
                                <div class="photo_info">
                                    <div class="photo">
                                        <img src="assets/profile/default_avatar.webp">
                                    </div>
                                    <div class="user_info">
                                        <p>${user.nome}</p>
                                        <span>Suporte técnico na Intelbras</span>
                                    </div>
                                </div>
                                <div class="user_email">
                                    ${user.email}
                                </div>
                            </div>
                        `;
                    }
                })
        })
}