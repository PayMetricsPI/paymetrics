

function alterar() {
    var IdUsuario = sessionStorage.ID_USUARIO;
    var nome = sessionStorage.NOME_USUARIO;

    console.log("id do usuario: " + IdUsuario);

    fetch(`usuario/renovar/${IdUsuario}`,
        {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                body: JSON.stringify({
                    senha: senhaVar,
                    nova: novaSenhaVar,
                    IdUsuario: IdUsuario
                }),
            },
        }).then(function (resposta) {
            console.log("Entrei no fetch");
            if (resposta.ok) {

                alert(nome + " sua senha foi alterada com sucesso!");
                console.log("Senha redefinida com sucesso" + nome);

                setTimeout(() => {
                    window.location = "embreve.html";
                }, "2000");

            } else {
                throw "Houve um erro ao tentar realizar a alteração da senha!"

            }

        })
        .catch(function (resposta) {
            console.log(`#ERRO: ${resposta}`);
        });

        return;

}
//by:caio 