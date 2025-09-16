var adm = sessionStorage.ADMINISTRADOR
console.log(adm);

// if (adm != "1") {
//     window.location.href = "./embreve.html";
// }

var tbody = document.getElementById("tbody_usuarios");

function listarUsuario() {
    var empresa = sessionStorage.EMPRESA;

    fetch(`/usuarios/listar/${empresa}`, { cache: 'no-store' })
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
                    tbody.innerHTML = '';
                    resposta.forEach((usuario, i) => {
                        var tr = document.createElement("tr");
                        tr.innerHTML = `
                            <td>${i + 1}</td>
                            <td class="colunaUsuario">${usuario.nome}</td>
                            <td class="colunaEmail">${usuario.email}</td>
                            <td class="colunaEmpresa">${usuario.razao_social}</td>
                            <td class="colunaAcesso">${usuario.adm == 1 ? 'Administrador' : 'Funcionário'}</td>
                            <td class="colunaDelete">
                                <svg onclick="deletarUsuario(${usuario.id})" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" fill="none"/><path fill="none" stroke="#f00" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                });
            } else {
                throw "Houve um erro na API!";
            }
        }).catch(console.error);
}

window.onload = listarUsuario;

function deletarUsuario(idUsuario) {
    if (confirm("Tem certeza que deseja deletar este usuário?")) {
        fetch(`/usuarios/deletar/${idUsuario}`, {
            method: "delete",
        }).then(response => {
            if (response.ok) {
                listarUsuario(); // Atualiza a lista
            } else {
                console.log("Erro ao deletar usuário.");
            }
        }).catch(error => {
            console.error(error);
            console.log("Erro ao deletar usuário.");
        })
    }
}



