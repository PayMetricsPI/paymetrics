var usuario = sessionStorage.ID_USUARIO

function carregarPerfil() {
    fetch(`/usuarios/verificar/${usuario}`, { cache: 'no-store' })
        .then(resposta => {
            if (resposta.ok) {
                if (resposta.status == 204) {
                    var listaUsuarios = document.getElementsByClassName("mostrarUsuarios")[0];
                    var mensagem = document.createElement("span");
                    mensagem.innerHTML = "Nenhum resultado encontrado.";
                    listaUsuarios.appendChild(mensagem);
                    throw "Nenhum resultado encontrado!!";
                }
                resposta.json().then(resposta => {
                    console.log(resposta)
                    document.getElementById('nome').innerText = resposta.nome
                    document.getElementById('email').innerText = resposta.email
                    document.getElementById('empresa').innerText = resposta.empresa
                });
            } else {
                throw "Houve um erro na API!";
            }
        }).catch(console.error);
}
