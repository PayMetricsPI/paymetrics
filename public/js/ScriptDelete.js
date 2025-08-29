var adm = sessionStorage.ADMINISTRADOR
console.log(adm);

if (adm != "1") {
    window.location.href = "../embreve.html";
}

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
                        var isSelf = usuario.id_usuario == sessionStorage.ID_USUARIO;
                        tr.innerHTML = `
                            <td>${i + 1}</td>
                            <td class="colunaUsuario">${usuario.nome}</td>
                            <td class="colunaEmail">${usuario.email}</td>
                             <td class="colunaEmpresa">${usuario.razao_social}</td>
                            <td class="colunaAcesso">${usuario.adm}</td>
                            <td class="colunaDelete">
                                ${isSelf
                                ? '<span style="color:gray;opacity:0.5;cursor:not-allowed;"><i class="fa-solid fa-trash"></i></span>'
                                : `<button onclick="deletarUsuario(${usuario.id_usuario})">
                                        <i class="fa-solid fa-trash" style="color: #ac0000;"></i>
                                    </button>`
                            }
                            </td>
                        `;
                        console.log(isSelf)
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

    const IdUsuario = sessionStorage.ID_USUARIO;

    console.log("ID do usuário: " + IdUsuario);

    if (confirm("Tem certeza que deseja deletar este usuário?")) {
        fetch(`/usuarios/deletar/${IdUsuario}`, {
            method: "post",
        }).then(response => {
            if (response.ok) {
                listarUsuarios(); // Atualiza a lista
            } else {
                console.log("Erro ao deletar usuário.");
            }
        }).catch(error => {
            console.error(error);
            console.log("Erro ao deletar usuário.");
        })
    }
}



